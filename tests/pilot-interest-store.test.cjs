'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotInterestStore} = require('../server/pilot-interest-store.cjs');
const id = '11111111-1111-4111-8111-111111111111';
const record = extra => ({contact_email: 'pilot@example.test', contact_permission: true, request_id: id, received_at: '2026-10-06T15:00:00.000Z', notice_version: 'synthetic-v1', ...extra});
function fixture(overrides = {}, environment = 'test') {
  const values = new Map(), calls = [];
  const provider = {
    async setJSON(key, value, options) {
      calls.push(['setJSON', key, options]);
      if (options?.onlyIfNew && values.has(key)) return {modified: false};
      values.set(key, structuredClone(value)); return {modified: true};
    },
    async get(key, options) { calls.push(['get', key, options]); return values.has(key) ? structuredClone(values.get(key)) : null; },
    async delete(key) { calls.push(['delete', key]); values.delete(key); },
    ...overrides
  };
  const adapter = createPilotInterestStore({environment, getStore: options => { calls.push(['getStore', options]); return provider; }});
  return {adapter, values, calls};
}
function listPages(...pages) {
  return () => ({async *[Symbol.asyncIterator]() { for (const page of pages) yield page; }});
}
test('test and production stores use distinct fixed names, EU region and strong consistency', () => {
  assert.deepEqual(fixture().calls[0], ['getStore', {
    name: 'cobro-pilot-interest-test-v1', consistency: 'strong', region: 'eu-central-1'
  }]);
  assert.deepEqual(fixture({}, 'production').calls[0], ['getStore', {
    name: 'cobro-pilot-interest-production-v1', consistency: 'strong', region: 'eu-central-1'
  }]);
});
test('preview, missing and arbitrary contexts cannot open a store', () => {
  for (const environment of [undefined, 'deploy-preview', 'branch-deploy', 'custom']) {
    assert.throws(() => createPilotInterestStore({environment, getStore: () => assert.fail('must not open store')}));
  }
});
test('confirms only after matching strongly consistent read, using an opaque key', async () => {
  const f = fixture();
  assert.deepEqual(await f.adapter.create(record()), {state: 'stored-confirmed', request_id: id, created: true});
  assert.deepEqual(f.calls[1], ['setJSON', `requests/${id}`, {onlyIfNew: true}]);
  assert.deepEqual(f.calls[2], ['get', `requests/${id}`, {type: 'json', consistency: 'strong'}]);
  assert.equal(JSON.stringify(f.calls).includes('pilot@example.test'), false);
});
test('retry of same trusted record creates one logical request', async () => {
  const f = fixture(); await f.adapter.create(record());
  assert.deepEqual(await f.adapter.create(record()), {state: 'stored-confirmed', request_id: id, created: false});
  assert.equal(f.values.size, 1);
});
test('same ID and logical payload confirm the original timestamp on a later retry', async () => {
  const f = fixture(); await f.adapter.create(record());
  assert.deepEqual(await f.adapter.create(record({received_at: '2026-10-06T15:05:00.000Z'})), {
    state: 'stored-confirmed', request_id: id, created: false
  });
  assert.equal((await f.adapter.read(id)).received_at, '2026-10-06T15:00:00.000Z');
});
test('same ID cannot confirm an earlier timestamp', async () => {
  const f = fixture();
  await f.adapter.create(record({received_at: '2026-10-06T15:05:00.000Z'}));
  assert.deepEqual(await f.adapter.create(record()), {state: 'conflict'});
  assert.equal((await f.adapter.read(id)).received_at, '2026-10-06T15:05:00.000Z');
});
test('retry timestamp ordering uses instants rather than ISO lexical order', async () => {
  const later = fixture();
  await later.adapter.create(record({received_at: '9999-12-31T23:59:59.999Z'}));
  assert.equal((await later.adapter.create(record({received_at: '+010000-01-01T00:00:00.000Z'}))).state, 'stored-confirmed');

  const earlier = fixture();
  await earlier.adapter.create(record({received_at: '+010000-01-01T00:00:00.000Z'}));
  assert.deepEqual(await earlier.adapter.create(record({received_at: '2026-10-06T15:00:00.000Z'})), {state: 'conflict'});
});
test('provider-normalized stored fields never confirm a write or retry', async () => {
  for (const modified of [true, false]) {
    const expected = record();
    const f = fixture({
      setJSON: async () => ({modified}),
      get: async () => ({...expected, contact_email: ` ${expected.contact_email} `})
    });
    assert.deepEqual(await f.adapter.create(expected), {state: 'conflict'});
  }
});
test('concurrent retries use create-if-new rather than read-then-write', async () => {
  const f = fixture(); const results = await Promise.all([f.adapter.create(record()), f.adapter.create(record())]);
  assert.equal(results.filter(r => r.created === true).length, 1);
  assert.equal(f.values.size, 1);
});
test('same ID with changed contact or notice is a conflict and never overwrites', async () => {
  const f = fixture(); await f.adapter.create(record());
  for (const extra of [{contact_email: 'other@example.test'}, {notice_version: 'synthetic-v2'}, {business_name: 'Ficticio'}]) {
    assert.deepEqual(await f.adapter.create(record(extra)), {state: 'conflict'});
  }
  assert.deepEqual(await f.adapter.read(id), record());
});
test('missing, mismatched or unavailable reads never claim confirmed storage', async () => {
  for (const get of [async () => null, async () => ({other: true}), async () => {throw Error('private provider failure');}]) {
    const result = await fixture({get}).adapter.create(record());
    assert.notEqual(result.state, 'stored-confirmed');
    assert.equal(JSON.stringify(result).includes('private provider failure'), false);
  }
});
test('ambiguous write failure is unverified; retry with same ID can recover', async () => {
  let stored = null, first = true;
  const f = fixture({setJSON: async (key, value) => {
    if (first) {first = false; stored = structuredClone(value); throw Error('timeout after write');}
    return {modified: false};
  }, get: async () => stored});
  assert.deepEqual(await f.adapter.create(record()), {state: 'received-unverified'});
  assert.deepEqual(await f.adapter.create(record()), {state: 'stored-confirmed', request_id: id, created: false});
});
test('invalid records and arbitrary keys are rejected before provider calls', async () => {
  const f = fixture();
  for (const extra of [{contact_permission: false}, {request_id: 'pilot@example.test'}, {received_at: 'yesterday'}, {notice_version: ''}, {invoices: []}]) {
    await assert.rejects(f.adapter.create(record(extra)), /Invalid private record/);
  }
  for (const key of ['../private', 'pilot@example.test', undefined]) {
    assert.throws(() => f.adapter.read(key));
    await assert.rejects(f.adapter.suppress(key));
    await assert.rejects(f.adapter.delete(key));
  }
  assert.equal(f.calls.length, 1);
});
test('deletion is confirmed only after strong read returns null', async () => {
  const f = fixture(); await f.adapter.create(record());
  assert.deepEqual(await f.adapter.delete(id), {state: 'deleted-confirmed'});
  assert.equal(f.values.size, 0);
  assert.deepEqual(f.calls.at(-1), ['get', `requests/${id}`, {type: 'json', consistency: 'strong'}]);
});
test('failed deletion or remaining record is never confirmed', async () => {
  const unchanged = fixture({delete: async () => {}}); await unchanged.adapter.create(record());
  assert.deepEqual(await unchanged.adapter.delete(id), {state: 'delete-unverified'});
  assert.deepEqual(await fixture({delete: async () => {throw Error('private');}}).adapter.delete(id), {state: 'delete-unverified'});
});
test('production physical deletion is unavailable and cannot remove a suppression marker', async () => {
  const f = fixture({}, 'production');
  await f.adapter.create(record());
  await f.adapter.suppress(id);
  const callsBefore = f.calls.length;
  assert.deepEqual(await f.adapter.delete(id), {state: 'delete-unavailable'});
  assert.equal(f.calls.length, callsBefore);
  assert.deepEqual(await f.adapter.create(record()), {state: 'suppressed'});
  assert.deepEqual(await f.adapter.read(id), {state: 'suppressed'});
});
test('suppression replaces contact data and blocks a replayed create', async () => {
  const f = fixture(); await f.adapter.create(record());
  assert.deepEqual(await f.adapter.suppress(id), {state: 'suppressed-confirmed'});
  assert.deepEqual(await f.adapter.read(id), {state: 'suppressed'});
  assert.equal(JSON.stringify([...f.values.values()]).includes('pilot@example.test'), false);
  assert.deepEqual(await f.adapter.create(record({received_at: '2026-10-06T15:05:00.000Z'})), {state: 'suppressed'});
  assert.deepEqual(await f.adapter.read(id), {state: 'suppressed'});
});
test('suppression wins while a delayed create-only write is in flight', async () => {
  const values = new Map();
  let release;
  const delayed = new Promise(resolve => { release = resolve; });
  let firstCreate = true;
  const provider = {
    async setJSON(key, value, options) {
      if (options?.onlyIfNew && firstCreate) {
        firstCreate = false;
        await delayed;
        if (values.has(key)) return {modified: false};
      }
      values.set(key, structuredClone(value));
      return {modified: true};
    },
    async get(key) { return values.has(key) ? structuredClone(values.get(key)) : null; },
    async delete(key) { values.delete(key); }
  };
  const adapter = createPilotInterestStore({environment: 'test', getStore: () => provider});
  const pending = adapter.create(record());
  assert.deepEqual(await adapter.suppress(id), {state: 'suppressed-confirmed'});
  release();
  assert.deepEqual(await pending, {state: 'suppressed'});
  assert.deepEqual(await adapter.read(id), {state: 'suppressed'});
});
test('suppression never confirms an unverified provider result or readback', async () => {
  const noWrite = fixture({setJSON: async () => ({modified: false})});
  assert.deepEqual(await noWrite.adapter.suppress(id), {state: 'suppression-unverified'});
  const mismatched = fixture({setJSON: async () => ({modified: true}), get: async () => ({state: 'other'})});
  assert.deepEqual(await mismatched.adapter.suppress(id), {state: 'suppression-unverified'});
});
test('private contact matching validates exact records and suppression markers', async () => {
  const f = fixture();
  await f.adapter.create(record({contact_email: 'Pilot@Example.TEST'}));
  assert.deepEqual(await f.adapter.matchContact(id, 'pilot@example.test'), {state: 'matched'});
  assert.deepEqual(await f.adapter.matchContact(id, 'other@example.test'), {state: 'mismatch'});
  await f.adapter.suppress(id);
  assert.deepEqual(await f.adapter.matchContact(id, 'pilot@example.test'), {state: 'suppressed'});
});
test('private contact matching fails closed for malformed or unavailable records', async () => {
  const malformed = fixture({get: async () => ({contact_email: 'pilot@example.test'})});
  assert.deepEqual(await malformed.adapter.matchContact(id, 'pilot@example.test'), {state: 'unverified'});
  const unavailable = fixture({get: async () => { throw new Error('private provider detail'); }});
  assert.deepEqual(await unavailable.adapter.matchContact(id, 'pilot@example.test'), {state: 'unverified'});
  await assert.rejects(unavailable.adapter.matchContact(id, ' Pilot@example.test '), /Invalid private contact/);
});
test('private reconciliation listing validates, sorts and bounds exact opaque request keys', async () => {
  const id2 = '22222222-2222-4222-8222-222222222222';
  const listed = fixture({
    list: listPages(
      {blobs: [{key: `requests/${id2}`}], directories: []},
      {blobs: [{key: `requests/${id}`}], directories: []}
    )
  });
  assert.deepEqual(await listed.adapter.listIds(), [id, id2]);

  for (const list of [
    listPages({blobs: [{key: 'requests/not-an-id'}], directories: []}),
    listPages({blobs: [{key: `requests/${id}`}, {key: `requests/${id}`}], directories: []}),
    listPages({blobs: [], directories: ['requests/nested/']}),
    () => null
  ]) {
    await assert.rejects(fixture({list}).adapter.listIds(), /list unverified/);
  }
  const bounded = createPilotInterestStore({
    environment: 'test', maxIds: 1,
    getStore: () => ({
      setJSON: async () => ({modified: true}), get: async () => null, delete: async () => {},
      list: listPages({blobs: [{key: `requests/${id}`}, {key: `requests/${id2}`}], directories: []})
    })
  });
  await assert.rejects(bounded.listIds(), /list limit/);
  const emptyPageLoop = createPilotInterestStore({
    environment: 'test', maxIds: 1,
    getStore: () => ({
      setJSON: async () => ({modified: true}), get: async () => null, delete: async () => {},
      list: listPages(
        {blobs: [], directories: []},
        {blobs: [], directories: []}
      )
    })
  });
  await assert.rejects(emptyPageLoop.listIds(), /list limit/);
});
test('private reconciliation inspection accepts only exact records and strips suppressed contact', async () => {
  const f = fixture();
  f.values.set(`requests/${id}`, record());
  assert.deepEqual(await f.adapter.inspectForReconciliation(id), {
    state: 'active', contact: 'pilot@example.test'
  });
  f.values.set(`requests/${id}`, {...record(), unexpected: true});
  assert.deepEqual(await f.adapter.inspectForReconciliation(id), {state: 'unverified'});
  f.values.set(`requests/${id}`, {state: 'suppressed'});
  assert.deepEqual(await f.adapter.inspectForReconciliation(id), {state: 'suppressed'});
});
test('snapshots and normalizes request before asynchronous storage work', async () => {
  const f = fixture(), input = record({contact_email: ' pilot@example.test ', business_name: ' Ficticio '});
  const pending = f.adapter.create(input); input.contact_email = 'changed@example.test';
  assert.equal((await pending).state, 'stored-confirmed');
  assert.equal((await f.adapter.read(id)).contact_email, 'pilot@example.test');
});

