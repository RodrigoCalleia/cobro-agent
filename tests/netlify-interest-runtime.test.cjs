const {test} = require('node:test');
const assert = require('node:assert/strict');
const {openPublishedInterestStore} = require('../server/netlify-interest-store.cjs');

const published = {
  deploy: {context: 'production', published: true},
  site: {name: 'cobro-agent-rodrigo', id: 'synthetic-site'}
};
const record = {
  contact_email: 'synthetic@example.invalid',
  business_name: 'Synthetic fixture',
  contact_permission: true,
  request_id: '9fefed22-4070-4b2d-89a0-c494e2c6b238',
  received_at: '2026-10-06T00:00:00.000Z',
  notice_version: 'fixture-only'
};

test('disabled deployed handler never accesses a request, context or network', async t => {
  const {default: handler} = await import('../netlify/functions/pilot-interest.mjs');
  let networkCalls = 0;
  t.mock.method(globalThis, 'fetch', () => {networkCalls++; throw new Error('No network allowed');});
  const forbidden = new Proxy({}, {get() {throw new Error('Request/context must not be accessed');}});
  for (const context of [forbidden, published, {deploy: {context: 'deploy-preview'}}]) {
    const response = await handler(forbidden, context);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assert.deepEqual(await response.json(), {state: 'unavailable'});
  }
  assert.equal(networkCalls, 0);
});

test('disabled handler does not consume even a valid synthetic POST', async () => {
  const {default: handler} = await import('../netlify/functions/pilot-interest.mjs');
  const request = new Request('https://example.invalid/.netlify/functions/pilot-interest', {
    method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(record)
  });
  const response = await handler(request, published);
  assert.equal(request.bodyUsed, false);
  assert.deepEqual(await response.json(), {state: 'unavailable'});
});

test('unknown, preview, unpublished and wrong-site contexts fail before SDK load', async () => {
  let loads = 0;
  const loadSDK = async () => {loads++; throw new Error('SDK must not be loaded');};
  for (const context of [undefined, {}, {environment: 'production'},
    {...published, deploy: {context: 'deploy-preview', published: true}},
    {...published, deploy: {context: 'branch-deploy', published: true}},
    {...published, deploy: {context: 'dev', published: true}},
    {...published, deploy: {context: 'production', published: false}},
    {...published, deploy: {context: 'production', published: 'true'}},
    {...published, site: {...published.site, name: 'another-site'}},
    {...published, site: {...published.site, id: ''}}
  ]) await assert.rejects(openPublishedInterestStore(context, {loadSDK}), /Unsupported storage context/);
  assert.equal(loads, 0);
});

// Exercise the installed SDK against an in-process transport, with synthetic
// credentials/URLs only. No network or private provider record is involved.
async function sdkFixture(t, {initial = null, writeStatus, deleteStatus = 200} = {}) {
  // The SDK uses a 1ms retry delay in test mode, instead of its 5s default.
  const previousEnv = process.env.NODE_ENV;
  let getStore;
  try {
    process.env.NODE_ENV = 'test';
    ({getStore} = await import('@netlify/blobs'));
  } finally {
    if (previousEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnv;
  }
  const requests = [];
  let stored = initial;
  t.mock.method(globalThis, 'fetch', () => {throw new Error('No real network allowed');});
  const transport = async (input, options) => {
    const url = new URL(input);
    assert.equal(url.origin, 'https://strong.example.invalid');
    requests.push({method: options.method, headers: options.headers, path: url.pathname});
    if (options.method === 'put') {
      assert.equal(options.headers['if-none-match'], '*');
      assert.equal(options.headers['content-type'], 'application/json');
      if (writeStatus) return new Response(null, {status: writeStatus});
      if (stored) return new Response(null, {status: 412});
      stored = JSON.parse(options.body);
      return new Response(null, {status: 200, headers: {etag: 'fixture-etag'}});
    }
    if (options.method === 'get') return stored ?
      Response.json(stored) : new Response(null, {status: 404});
    if (options.method === 'delete') {
      if (deleteStatus === 200) stored = null;
      return new Response(null, {status: deleteStatus});
    }
    throw new Error('Unexpected fixture method');
  };
  const adapter = await openPublishedInterestStore(published, {
    fetchImpl: transport,
    loadSDK: async () => ({getStore: options => getStore({
      ...options, siteID: 'synthetic-site', token: 'synthetic-not-a-credential',
      edgeURL: 'https://cached.example.invalid',
      uncachedEdgeURL: 'https://strong.example.invalid'
    })})
  });
  return {adapter, requests};
}

test('installed pinned SDK supports create-only, strong read, retry and verified delete', async t => {
  assert.equal(require('@netlify/blobs/package.json').version, '11.1.1');
  const {adapter, requests} = await sdkFixture(t);
  assert.deepEqual(await adapter.create(record), {
    state: 'stored-confirmed', request_id: record.request_id, created: true
  });
  assert.deepEqual(await adapter.create(record), {
    state: 'stored-confirmed', request_id: record.request_id, created: false
  });
  assert.deepEqual(await adapter.read(record.request_id), record);
  assert.deepEqual(await adapter.delete(record.request_id), {state: 'deleted-confirmed'});
  assert.ok(requests.every(r => r.path.includes('/site:cobro-pilot-interest-production-v1/requests/')));
  assert.deepEqual(requests.map(r => r.method), ['put','get','put','get','get','delete','get']);
});

test('actual SDK retry with conflicting record never overwrites', async t => {
  const {adapter} = await sdkFixture(t, {initial: {...record, business_name: 'Earlier fixture'}});
  assert.deepEqual(await adapter.create(record), {state: 'conflict'});
  assert.equal((await adapter.read(record.request_id)).business_name, 'Earlier fixture');
});

for (const status of [201, 400, 403, 404, 429, 500, 503]) {
  test('unexpected conditional PUT '+status+' cannot claim success from an existing matching record', async t => {
    const {adapter, requests} = await sdkFixture(t, {initial: record, writeStatus: status});
    assert.deepEqual(await adapter.create(record), {state: 'received-unverified'});
    assert.equal(requests.length, 6); // The actual SDK retries a thrown transport error five times.
    assert.ok(requests.every(r => r.method === 'put'));
  });
}
