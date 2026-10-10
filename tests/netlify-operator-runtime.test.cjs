'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {openPublishedOperatorRepair} = require('../server/netlify-operator-runtime.cjs');

const published = {deploy: {context: 'production', published: true}, site: {name: 'cobro-agent-rodrigo', id: 'synthetic-site'}};
const keyring = {active: {version: 'k1', secret: Buffer.alloc(32, 0x41)}};
const command = {
  schema_version: 'repair-command-v1', operation_id: '11111111-1111-4111-8111-111111111111',
  request_id: '22222222-2222-4222-8222-222222222222', action: 'contact-index.repair-one',
  environment: 'production', site_id: 'cobro-agent-rodrigo',
  reason_code: 'reconciliation-missing-membership', ticket_ref: 'reconciliation:synthetic-1',
  policy_version: 'operator-repair-v1'
};

function fakeSDK() {
  const audit = {setJSON: async () => ({etag: 'e1', modified: true}), getWithMetadata: async () => null};
  const rights = {
    setJSON: async () => ({modified: false}), get: async () => null,
    delete: async () => ({deleted: false}), list: async function* () { yield {blobs: [], directories: []}; }
  };
  return {getStore: options => options.name.includes('operator-audit') ? audit : rights};
}

function authorized(now = Date.now()) {
  return {state: 'authorized', actor_ref: 'operator:synthetic',
    authorization_id: '55555555-5555-4555-8555-555555555555',
    issued_at: new Date(now - 1000).toISOString(),
    expires_at: new Date(now + 120000).toISOString()};
}

function stagedSDK({stallRepair = false, stallTerminal = false} = {}) {
  const stores = new Map();
  let auditWrites = 0;
  let releaseRepair;
  let releaseTerminal;
  const record = {
    contact_email: 'synthetic@example.invalid', business_name: 'Synthetic Agency',
    contact_permission: true, request_id: command.request_id,
    received_at: new Date(Date.now() - 1000).toISOString(), notice_version: 'synthetic-v1'
  };
  function storeFor(name) {
    if (stores.has(name)) return stores.get(name);
    const data = new Map(); let etag = 0;
    if (name.includes('operator-audit')) {
      const store = {
        async setJSON(key, value, condition) {
          auditWrites += 1;
          const write = () => {
            const current = data.get(key);
            if (condition.onlyIfNew && current) return {modified: false};
            if (condition.onlyIfMatch && (!current || current.etag !== condition.onlyIfMatch)) {
              return {modified: false};
            }
            etag += 1;
            data.set(key, {value: structuredClone(value), etag: `audit-${etag}`});
            return {modified: true, etag: `audit-${etag}`};
          };
          if (stallTerminal && value.events.length === 2) {
            return new Promise(resolve => { releaseTerminal = () => resolve(write()); });
          }
          return write();
        },
        async getWithMetadata(key) {
          const current = data.get(key);
          return current ? {data: structuredClone(current.value), etag: current.etag, metadata: {}} : null;
        }
      };
      stores.set(name, store); return store;
    }
    const store = {
      async setJSON(key, value, condition) {
        const current = data.get(key);
        if (condition?.onlyIfNew && current) return {modified: false};
        data.set(key, structuredClone(value)); return {modified: true};
      },
      async get(key) {
        if (stallRepair && name.includes('interest') && key === `requests/${command.request_id}`) {
          return new Promise(resolve => { releaseRepair = () => resolve(structuredClone(record)); });
        }
        const value = data.get(key);
        return value === undefined ? null : structuredClone(value);
      },
      async delete(key) { return {deleted: data.delete(key)}; },
      async *list({prefix = ''} = {}) {
        yield {blobs: [...data.keys()].filter(key => key.startsWith(prefix)).map(key => ({key})), directories: []};
      }
    };
    if (name.includes('interest')) data.set(`requests/${command.request_id}`, record);
    stores.set(name, store); return store;
  }
  return {
    sdk: {getStore: options => storeFor(options.name)},
    releaseRepair: () => releaseRepair?.(),
    releaseTerminal: () => releaseTerminal?.(),
    auditWrites: () => auditWrites
  };
}

test('opens only for the published production site and shares the deadline with authorization', async () => {
  let calls = 0;
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    loadSDK: async () => fakeSDK(), fetchImpl: async () => new Response('{}'),
    authorize: async value => { calls += 1; assert.equal(value.request_id, command.request_id); return {state: 'denied'}; }
  });
  assert.deepEqual(await runtime.execute(command), {state: 'rejected'});
  assert.equal(calls, 1);
});

test('a stalled SDK load consumes the single budget and never authorizes or repairs', async () => {
  let authorized = false;
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    timeoutMs: 20, loadSDK: () => new Promise(() => {}), fetchImpl: async () => new Response('{}'),
    authorize: async () => { authorized = true; return {state: 'denied'}; }
  });
  assert.deepEqual(await runtime.execute(command), {state: 'unverified'});
  assert.equal(authorized, false);
});

test('a stalled authorization consumes the same budget and cannot start an audit claim', async () => {
  let auditWrites = 0;
  const base = fakeSDK();
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    timeoutMs: 20,
    loadSDK: async () => ({getStore(options) {
      const store = base.getStore(options);
      if (!options.name.includes('operator-audit')) return store;
      return {setJSON: async (...args) => { auditWrites += 1; return store.setJSON(...args); },
        getWithMetadata: store.getWithMetadata};
    }}),
    fetchImpl: async () => new Response('{}'), authorize: () => new Promise(() => {})
  });
  assert.deepEqual(await runtime.execute(command), {state: 'unverified'});
  assert.equal(auditWrites, 0);
});

test('a stalled audit claim consumes the shared budget and cannot start repair storage', async () => {
  let repairCalls = 0;
  const base = fakeSDK();
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    timeoutMs: 20,
    loadSDK: async () => ({getStore(options) {
      if (options.name.includes('operator-audit')) {
        return {setJSON: () => new Promise(() => {}), getWithMetadata: async () => null};
      }
      const store = base.getStore(options);
      return {
        setJSON: async (...args) => { repairCalls += 1; return store.setJSON(...args); },
        get: async (...args) => { repairCalls += 1; return store.get(...args); },
        delete: store.delete, list: store.list
      };
    }}),
    fetchImpl: async () => new Response('{}'), authorize: async () => authorized()
  });
  assert.deepEqual(await runtime.execute(command), {state: 'unverified'});
  assert.equal(repairCalls, 0);
});

test('a stalled repair cannot append a terminal audit even after late resolution', async () => {
  const staged = stagedSDK({stallRepair: true});
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    timeoutMs: 20, loadSDK: async () => staged.sdk,
    fetchImpl: async () => new Response('{}'), authorize: async () => authorized()
  });
  assert.deepEqual(await runtime.execute(command), {state: 'unverified'});
  assert.equal(staged.auditWrites(), 1);
  staged.releaseRepair();
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(staged.auditWrites(), 1);
});

test('a stalled terminal write returns unverified and a durable late write is replay-safe', async () => {
  const staged = stagedSDK({stallTerminal: true});
  const options = {
    timeoutMs: 20, loadSDK: async () => staged.sdk,
    fetchImpl: async () => new Response('{}'), authorize: async () => authorized()
  };
  const runtime = await openPublishedOperatorRepair(published, keyring, options);
  assert.deepEqual(await runtime.execute(command), {state: 'unverified'});
  assert.equal(staged.auditWrites(), 2);
  staged.releaseTerminal();
  await new Promise(resolve => setTimeout(resolve, 30));
  const replay = await openPublishedOperatorRepair(published, keyring, {...options, timeoutMs: 1000});
  assert.deepEqual(await replay.execute(command), {state: 'completed', outcome: 'indexed-confirmed'});
  // Replay performs one create-only claim probe, then reads the durable terminal event.
  assert.equal(staged.auditWrites(), 3);
});

test('verified audit transport rejects unexpected PUT success before readback', async () => {
  let auditReads = 0;
  const base = fakeSDK();
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    loadSDK: async () => ({getStore(options) {
      if (!options.name.includes('operator-audit')) return base.getStore(options);
      return {
        async setJSON() {
          await options.fetch('https://synthetic.invalid/audit', {method: 'PUT'});
          return {etag: 'false-success', modified: true};
        },
        async getWithMetadata() { auditReads += 1; return null; }
      };
    }}),
    fetchImpl: async () => new Response('{}', {status: 201}), authorize: async () => authorized()
  });
  assert.deepEqual(await runtime.execute(command), {state: 'unverified'});
  assert.equal(auditReads, 0);
});

test('invalid contexts and unbounded budgets fail before opening SDK', async () => {
  for (const context of [{}, {deploy: {context: 'deploy-preview', published: true}, site: published.site}]) {
    await assert.rejects(openPublishedOperatorRepair(context, keyring, {
      authorize: async () => ({state: 'denied'}), fetchImpl: async () => new Response('{}')
    }), /Unsupported operator repair context/);
  }
  await assert.rejects(openPublishedOperatorRepair(published, keyring, {
    timeoutMs: 10001, authorize: async () => ({state: 'denied'}), fetchImpl: async () => new Response('{}')
  }), /Unsupported operator repair deadline/);
});

test('synthetic read-only acceptance composes authorization, claim, repair and terminal audit', async () => {
  const operationId = '33333333-3333-4333-8333-333333333333';
  const requestId = '44444444-4444-4444-8444-444444444444';
  const stores = new Map();
  const record = {
    contact_email: 'synthetic@example.invalid', business_name: 'Synthetic Agency',
    contact_permission: true, request_id: requestId,
    received_at: new Date(Date.now() - 1000).toISOString(), notice_version: 'synthetic-v1'
  };
  function storeFor(name) {
    if (stores.has(name)) return stores.get(name);
    const data = new Map(); let etag = 0;
    if (name.includes('operator-audit')) {
      const store = {
        async setJSON(key, value, condition) {
          const current = data.get(key);
          if (condition.onlyIfNew && current) return {modified: false};
          if (condition.onlyIfMatch && (!current || current.etag !== condition.onlyIfMatch)) return {modified: false};
          etag += 1; data.set(key, {value: structuredClone(value), etag: `audit-${etag}`});
          return {modified: true, etag: `audit-${etag}`};
        },
        async getWithMetadata(key) {
          const current = data.get(key);
          return current ? {data: structuredClone(current.value), etag: current.etag, metadata: {}} : null;
        }
      };
      stores.set(name, store); return store;
    }
    const store = {
      async setJSON(key, value, condition) {
        const current = data.get(key);
        if (condition?.onlyIfNew && current) return {modified: false};
        data.set(key, structuredClone(value)); return {modified: true};
      },
      async get(key) {
        const value = data.get(key);
        return value === undefined ? null : structuredClone(value);
      },
      async delete(key) { return {deleted: data.delete(key)}; },
      async *list({prefix = ''} = {}) {
        yield {blobs: [...data.keys()].filter(key => key.startsWith(prefix)).map(key => ({key})), directories: []};
      }
    };
    if (name.includes('interest')) data.set(`requests/${requestId}`, record);
    stores.set(name, store); return store;
  }
  const now = Date.now();
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    timeoutMs: 1000, loadSDK: async () => ({getStore: options => storeFor(options.name)}),
    fetchImpl: async () => new Response('{}'),
    authorize: async commandValue => ({state: 'authorized', actor_ref: 'operator:synthetic',
      authorization_id: '55555555-5555-4555-8555-555555555555',
      issued_at: new Date(now - 1000).toISOString(), expires_at: new Date(now + 120000).toISOString()})
  });
  const result = await runtime.execute({...command, operation_id: operationId, request_id: requestId});
  assert.deepEqual(result, {state: 'completed', outcome: 'indexed-confirmed'});
  const auditStore = stores.get('cobro-pilot-operator-audit-production-v1');
  const auditDoc = (await auditStore.getWithMetadata(`operations/${operationId}`)).data;
  assert.deepEqual(auditDoc.events.map(event => event.type), ['claimed', 'completed']);
  assert.equal(stores.get('cobro-pilot-contact-index-production-v1') !== undefined, true);
});
