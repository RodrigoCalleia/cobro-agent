'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {openPublishedContactRights} = require('../server/netlify-contact-rights.cjs');

const published = {
  deploy: {context: 'production', published: true},
  site: {name: 'cobro-agent-rodrigo', id: 'synthetic-site'}
};
const id = '11111111-1111-4111-8111-111111111111';
const contact = 'synthetic@example.invalid';
const record = {
  contact_email: contact,
  contact_permission: true,
  request_id: id,
  received_at: '2026-10-09T06:00:00.000Z',
  notice_version: 'synthetic-v1'
};
const keyring = {active: {version: 'k1', secret: Buffer.alloc(32, 0x41)}};

async function installedSDK() {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'test';
    return await import('@netlify/blobs');
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
}

async function fixture(t, transport, options = {}) {
  const {getStore} = await installedSDK();
  const requests = [];
  t.mock.method(globalThis, 'fetch', () => { throw new Error('No real network allowed'); });
  const fetchImpl = (input, request) => {
    const url = new URL(input);
    requests.push({url, method: request.method, signal: request.signal});
    if (request.method !== 'get') throw new Error('Reconciliation must be read-only');
    return transport(input, request, requests.length);
  };
  const rights = await openPublishedContactRights(published, keyring, {
    timeoutMs: 50,
    ...options,
    fetchImpl,
    loadSDK: async () => ({getStore: storeOptions => getStore({
      ...storeOptions,
      siteID: 'synthetic-site',
      token: 'synthetic-not-a-credential',
      edgeURL: 'https://cached.example.invalid',
      uncachedEdgeURL: 'https://strong.example.invalid'
    })})
  });
  return {rights, requests};
}

function successfulTransport(input) {
  const url = new URL(input);
  const prefix = url.searchParams.get('prefix');
  if (prefix === 'requests/') {
    return Response.json({blobs: [{key: `requests/${id}`}], directories: []});
  }
  if (prefix?.startsWith('members/')) {
    return Response.json({blobs: [], directories: []});
  }
  if (url.pathname.includes('cobro-pilot-interest-production-v1')) {
    return Response.json(record);
  }
  throw new Error('Unexpected synthetic request');
}

test('one abortable budget covers request listing, strong read and contact listing', async t => {
  const {rights, requests} = await fixture(t, successfulTransport);
  assert.deepEqual(await rights.planReconciliation(), {
    state: 'ready', indexed: [], missingMemberships: [id], suppressed: []
  });
  assert.deepEqual(requests.map(item => item.url.searchParams.get('prefix')), [
    'requests/', null, requests[2].url.searchParams.get('prefix')
  ]);
  assert.match(requests[2].url.searchParams.get('prefix'), /^members\/[a-f0-9]{64}\/$/u);
  assert.equal(new Set(requests.map(item => item.signal)).size, 1);
  assert.ok(requests.every(item => item.url.hostname === 'strong.example.invalid'));
  assert.ok(requests.every(item => item.url.pathname.includes('/region:eu-central-1/')));
});

test('a stalled request-list fetch aborts and returns no partial plan', async t => {
  const {rights, requests} = await fixture(t, () => new Promise(() => {}), {timeoutMs: 20});
  assert.deepEqual(await rights.planReconciliation(), {state: 'unverified'});
  assert.equal(requests.length, 1);
  assert.equal(requests[0].signal.aborted, true);
});

test('a stalled strong request read cannot start a contact lookup after timeout', async t => {
  let finish;
  const {rights, requests} = await fixture(t, (input, request, call) => {
    if (call === 1) return successfulTransport(input);
    return new Promise(resolve => { finish = resolve; });
  }, {timeoutMs: 20});
  assert.deepEqual(await rights.planReconciliation(), {state: 'unverified'});
  assert.equal(requests.length, 2);
  assert.equal(requests[1].signal.aborted, true);
  finish(Response.json(record));
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(requests.length, 2);
});

test('a stalled contact-list body cannot continue pagination or return ready', async t => {
  let finishBody;
  const {rights, requests} = await fixture(t, input => {
    const response = successfulTransport(input);
    const url = new URL(input);
    if (url.searchParams.get('prefix')?.startsWith('members/')) {
      response.json = () => new Promise(resolve => { finishBody = resolve; });
    }
    return response;
  }, {timeoutMs: 20});
  assert.deepEqual(await rights.planReconciliation(), {state: 'unverified'});
  assert.equal(requests.length, 3);
  assert.equal(requests[2].signal.aborted, true);
  finishBody({
    blobs: [], directories: [], next_cursor: 'must-not-be-requested'
  });
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(requests.length, 3);
});

test('response bodies and sequential operations consume the same total budget', async t => {
  const delayed = input => {
    const response = successfulTransport(input);
    const original = response.json.bind(response);
    response.json = async () => {
      await new Promise(resolve => setTimeout(resolve, 15));
      return original();
    };
    return response;
  };
  const {rights, requests} = await fixture(t, delayed, {timeoutMs: 25});
  assert.deepEqual(await rights.planReconciliation(), {state: 'unverified'});
  assert.equal(requests.length, 2);
  assert.equal(requests[0].signal, requests[1].signal);
  assert.equal(requests[1].signal.aborted, true);
});

test('expiration of one plan leaves concurrent and later plans usable', async t => {
  const {rights, requests} = await fixture(t, (input, request, call) => {
    if (call === 1) return new Promise(() => {});
    const url = new URL(input);
    assert.equal(url.searchParams.get('prefix'), 'requests/');
    return Response.json({blobs: [], directories: []});
  }, {timeoutMs: 25});
  const slow = rights.planReconciliation();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(await rights.planReconciliation(), {
    state: 'ready', indexed: [], missingMemberships: [], suppressed: []
  });
  assert.deepEqual(await slow, {state: 'unverified'});
  assert.deepEqual(await rights.planReconciliation(), {
    state: 'ready', indexed: [], missingMemberships: [], suppressed: []
  });
  assert.notEqual(requests[0].signal, requests[1].signal);
  assert.equal(requests[0].signal.aborted, true);
});

test('context and deadline failures happen before SDK loading', async () => {
  let loads = 0;
  const loadSDK = async () => { loads += 1; throw new Error('must not load'); };
  for (const context of [undefined, {},
    {...published, deploy: {context: 'deploy-preview', published: true}},
    {...published, deploy: {context: 'production', published: false}},
    {...published, site: {...published.site, name: 'another-site'}}]) {
    await assert.rejects(openPublishedContactRights(context, keyring, {loadSDK}),
      /Unsupported rights storage context/);
  }
  for (const timeoutMs of [0, -1, 10001, 1.5, Infinity, '5000']) {
    await assert.rejects(openPublishedContactRights(published, keyring, {loadSDK, timeoutMs}),
      /Unsupported rights storage deadline/);
  }
  assert.equal(loads, 0);
});

test('SDK loading is inside the same deadline and late resolution starts no storage work', async () => {
  let finishLoad;
  let stores = 0;
  const rights = await openPublishedContactRights(published, keyring, {
    timeoutMs: 20,
    fetchImpl: () => { throw new Error('must not fetch'); },
    loadSDK: () => new Promise(resolve => { finishLoad = resolve; })
  });
  assert.deepEqual(await rights.planReconciliation(), {state: 'unverified'});
  finishLoad({getStore: () => { stores += 1; throw new Error('late store'); }});
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(stores, 0);
});
