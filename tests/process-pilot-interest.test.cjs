'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotInterestProcessor} = require('../server/process-pilot-interest.cjs');
const {createPilotInterestStore} = require('../server/pilot-interest-store.cjs');
const origin = 'https://pilot.example.test';
const token = '11111111-1111-4111-8111-111111111111';
const token2 = '22222222-2222-4222-8222-222222222222';
const payload = extra => ({contact_email: 'pilot@example.test', contact_permission: true, ...extra});
function request({method = 'POST', headers = {}, body = JSON.stringify(payload()), signal} = {}) {
  return new Request(`${origin}/api/pilot-interest`, {method, signal,
    headers: {origin, 'pilot-notice-version': 'synthetic-v1', 'idempotency-key': token,
      'content-type': 'application/json', ...headers},
    ...(!['GET', 'HEAD'].includes(method) ? {body} : {})});
}
function configuration(extra = {}) {
  return {allowedOrigin: origin, noticeVersion: 'synthetic-v1', secret: new Uint8Array(32).fill(3),
    now: () => new Date('2026-10-07T18:00:00.000Z'),
    openStore: () => ({create: () => ({state: 'received-unverified'})}), ...extra};
}
function fixture() {
  const values = new Map(), calls = [];
  let tick = 0;
  const config = configuration({now: () => {
    calls.push('now'); return new Date(Date.UTC(2026, 9, 7, 18, 0, tick++));
  }, openStore: async () => {
    calls.push('open');
    return createPilotInterestStore({environment: 'test', getStore: options => {
      calls.push(['getStore', options]);
      return {
        async setJSON(key, value, options) {
          calls.push(['setJSON', key, options]);
          if (values.has(key)) return {modified: false};
          values.set(key, structuredClone(value)); return {modified: true};
        },
        async get(key, options) {
          calls.push(['get', key, options]);
          return values.has(key) ? structuredClone(values.get(key)) : null;
        },
        async delete(key) { values.delete(key); }
      };
    }});
  }});
  return {values, calls, config, process: createPilotInterestProcessor(config)};
}
async function expect(result, status, body) {
  assert.equal(result.status, status);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(await result.json(), body);
}

test('composes validated request, metadata, conditional write and strong read without public private-data echoes', async () => {
  const f = fixture();
  assert.deepEqual(f.calls, []);
  await expect(await f.process(request()), 200, {state: 'stored-confirmed'});
  assert.equal(f.values.size, 1);
  const [[key, value]] = [...f.values];
  assert.notEqual(value.request_id, token);
  assert.equal(key, `requests/${value.request_id}`);
  assert.deepEqual(value, {...payload(), request_id: value.request_id,
    received_at: '2026-10-07T18:00:00.000Z', notice_version: 'synthetic-v1'});
  assert.deepEqual(f.calls.slice(0, 2), ['now', 'open']);
  assert.deepEqual(f.calls.at(-2), ['setJSON', key, {onlyIfNew: true}]);
  assert.deepEqual(f.calls.at(-1), ['get', key, {type: 'json', consistency: 'strong'}]);
});
test('manual retry of same normalized payload and token confirms one stored request with its original timestamp', async () => {
  const f = fixture();
  await expect(await f.process(request()), 200, {state: 'stored-confirmed'});
  await expect(await f.process(request({body: JSON.stringify(payload({contact_email: ' pilot@example.test '}))})),
    200, {state: 'stored-confirmed'});
  assert.equal(f.values.size, 1);
  assert.equal([...f.values.values()][0].received_at, '2026-10-07T18:00:00.000Z');
});
test('changed payload with same token returns conflict and cannot overwrite stored contact', async () => {
  const f = fixture();
  await f.process(request());
  await expect(await f.process(request({body: JSON.stringify(payload({contact_email: 'changed@example.test'}))})),
    409, {state: 'conflict'});
  assert.equal([...f.values.values()][0].contact_email, 'pilot@example.test');
});
test('new approved version with same retry token conflicts rather than reinterpreting stored notice', async () => {
  const f = fixture();
  await f.process(request());
  const next = createPilotInterestProcessor({...f.config, noticeVersion: 'synthetic-v2'});
  await expect(await next(request({headers: {'pilot-notice-version': 'synthetic-v2'}})), 409, {state: 'conflict'});
  assert.equal([...f.values.values()][0].notice_version, 'synthetic-v1');
});
test('method and origin fail before body consumption, clock or lazy storage access', async () => {
  const f = fixture();
  const post = request({method: 'PUT'});
  const result = await f.process(post);
  assert.equal(result.headers.get('allow'), 'POST');
  await expect(result, 405, {state: 'rejected', code: 'method_not_allowed'});
  assert.equal(post.bodyUsed, false);
  const crossOrigin = request({headers: {origin: 'https://other.example.test'}});
  await expect(await f.process(crossOrigin), 403, {state: 'rejected', code: 'origin_not_allowed'});
  assert.equal(crossOrigin.bodyUsed, false);
  await expect(await f.process({method: 'POST'}), 400, {state: 'rejected', code: 'invalid_request'});
  assert.deepEqual(f.calls, []);
});
test('stale, missing, duplicate and unrecognized notice headers fail before retry validation and body', async () => {
  const f = fixture();
  for (const version of ['synthetic-old', 'synthetic-v1, synthetic-v1', '', 'null']) {
    const req = request({headers: {'pilot-notice-version': version, 'idempotency-key': 'invalid'}});
    await expect(await f.process(req), 409, {state: 'rejected', code: 'notice_mismatch'});
    assert.equal(req.bodyUsed, false);
  }
  const req = request(); req.headers.delete('pilot-notice-version');
  await expect(await f.process(req), 409, {state: 'rejected', code: 'notice_mismatch'});
  assert.equal(req.bodyUsed, false);
  assert.deepEqual(f.calls, []);
});
test('invalid or absent retry token fails before body, clock and storage', async () => {
  const f = fixture();
  for (const key of ['', 'invalid', `${token}, ${token}`]) {
    const req = request({headers: {'idempotency-key': key}});
    await expect(await f.process(req), 400, {state: 'rejected', code: 'invalid_idempotency_key'});
    assert.equal(req.bodyUsed, false);
  }
  assert.deepEqual(f.calls, []);
});
test('body failures expose only fixed codes and never open store or generate metadata', async () => {
  const f = fixture();
  const cases = [
    [{headers: {'content-type': 'text/plain'}}, 415, 'unsupported_media_type'],
    [{headers: {'content-encoding': 'gzip'}}, 415, 'unsupported_encoding'],
    [{headers: {'content-length': '4097'}}, 413, 'too_large'],
    [{body: '{'}, 400, 'invalid_json'],
    [{body: '{"contact_email":"pilot@example.test","contact_permission":true,"contact_permission":false}'}, 400, 'duplicate_keys'],
    [{body: JSON.stringify(payload({contact_permission: false}))}, 400, 'validation_failed'],
    [{body: JSON.stringify(payload({notice_version: 'synthetic-v1'}))}, 400, 'validation_failed']
  ];
  for (const [input, status, code] of cases) {
    await expect(await f.process(request(input)), status, {state: 'rejected', code});
  }
  assert.deepEqual(f.calls, []);
});
test('invalid trusted clock fails unavailable before opening storage', async () => {
  for (const now of [() => new Date('invalid'), () => 'private timestamp', () => { throw new Error('private timestamp'); }]) {
    const process = createPilotInterestProcessor(configuration({now, openStore: () => assert.fail('must not open')}));
    await expect(await process(request()), 503, {state: 'unavailable'});
  }
});
test('aborting while metadata is generated prevents lazy store opening', async () => {
  const controller = new AbortController();
  const process = createPilotInterestProcessor(configuration({
    now: () => { controller.abort(); return new Date(); }, openStore: () => assert.fail('must not open')
  }));
  await expect(await process(request({signal: controller.signal})), 400, {state: 'rejected', code: 'request_aborted'});
});
test('aborting during lazy initialization prevents create', async () => {
  const controller = new AbortController();
  const process = createPilotInterestProcessor(configuration({openStore: async () => {
    controller.abort(); return {create: () => assert.fail('must not create')};
  }}));
  await expect(await process(request({signal: controller.signal})), 400, {state: 'rejected', code: 'request_aborted'});
});
test('missing, throwing and malformed openStore collaborators return generic unavailable', async () => {
  const bad = [() => null, () => ({}), () => ({create: true}),
    () => { throw new Error('private config'); }, async () => { throw new Error('private config'); },
    () => ({get create() { throw new Error('private config'); }})];
  for (const openStore of bad) {
    await expect(await createPilotInterestProcessor(configuration({openStore}))(request()), 503, {state: 'unavailable'});
  }
});
test('only exact matching confirmation with boolean created is success; provider anomalies are unverified', async () => {
  const invalid = [null, undefined, true, {}, [], {state: 'stored-confirmed'},
    {state: 'stored-confirmed', request_id: token, created: true},
    {state: 'received-unverified'}, {state: 'unavailable'},
    {state: 'conflict', contact_email: 'private@example.test'},
    {get state() { throw new Error('private provider failure'); }}];
  for (const value of invalid) {
    const process = createPilotInterestProcessor(configuration({openStore: () => ({create: () => value})}));
    await expect(await process(request()), 202, {state: 'received-unverified'});
  }
  for (const alter of [value => ({...value, created: 'true'}), value => ({...value, private: 'detail'}),
    value => Object.assign({...value}, {[Symbol('private')]: true})]) {
    const process = createPilotInterestProcessor(configuration({openStore: () => ({create: record => alter({
      state: 'stored-confirmed', request_id: record.request_id, created: true
    })})}));
    await expect(await process(request()), 202, {state: 'received-unverified'});
  }
});
test('exact confirmations for new and duplicate stored records have identical public response', async () => {
  for (const created of [true, false]) {
    const process = createPilotInterestProcessor(configuration({openStore: () => ({create: record => ({
      state: 'stored-confirmed', request_id: record.request_id, created
    })})}));
    await expect(await process(request()), 200, {state: 'stored-confirmed'});
  }
});
test('sync and async provider failures cannot claim write failed or confirmed', async () => {
  for (const create of [() => { throw new Error('private provider'); }, async () => { throw new Error('private provider'); }]) {
    await expect(await createPilotInterestProcessor(configuration({openStore: () => ({create})}))(request()),
      202, {state: 'received-unverified'});
  }
});
test('abort after dispatch does not claim successful persistence or undo a write', async () => {
  const controller = new AbortController();
  const process = createPilotInterestProcessor(configuration({openStore: () => ({create: record => {
    controller.abort(); return {state: 'stored-confirmed', request_id: record.request_id, created: true};
  }})}));
  await expect(await process(request({signal: controller.signal})), 202, {state: 'received-unverified'});
});
test('abort triggered by result schema or confirmation access cannot return a definitive result', async () => {
  for (const at of ['request_id', 'schema', 'conflict']) {
    const controller = new AbortController();
    const process = createPilotInterestProcessor(configuration({openStore: () => ({create: record => {
      if (at === 'conflict') return {get state() { controller.abort(); return 'conflict'; }};
      const result = {state: 'stored-confirmed', request_id: record.request_id, created: true};
      if (at === 'schema') return new Proxy(result, {
        ownKeys(target) { controller.abort(); return Reflect.ownKeys(target); }
      });
      Object.defineProperty(result, 'request_id', {
        get() { controller.abort(); return record.request_id; }, enumerable: true
      });
      return result;
    }})}));
    await expect(await process(request({signal: controller.signal})), 202, {state: 'received-unverified'});
  }
});
test('deadline crossing during provider result getters cannot confirm or classify conflict', async t => {
  const {performance} = require('node:perf_hooks');
  for (const field of ['state', 'created', 'conflict']) {
    const originalNow = performance.now.bind(performance);
    const process = createPilotInterestProcessor(configuration({openStore: () => ({create: record => {
      const result = field === 'conflict' ? {state: 'conflict'} :
        {state: 'stored-confirmed', request_id: record.request_id, created: true};
      const name = field === 'conflict' ? 'state' : field;
      const value = result[name];
      Object.defineProperty(result, name, {enumerable: true, get() {
        t.mock.method(performance, 'now', () => originalNow() + 5001);
        return value;
      }});
      return result;
    }})}));
    try { await expect(await process(request()), 202, {state: 'received-unverified'}); }
    finally { t.mock.restoreAll(); }
  }
});
test('confirmation accessor values are snapshotted once', async () => {
  const counts = {state: 0, request_id: 0, created: 0};
  const process = createPilotInterestProcessor(configuration({openStore: () => ({create: record => ({
    get state() { counts.state++; return 'stored-confirmed'; },
    get request_id() { counts.request_id++; return record.request_id; },
    get created() { counts.created++; return true; }
  })})}));
  await expect(await process(request()), 200, {state: 'stored-confirmed'});
  assert.deepEqual(counts, {state: 1, request_id: 1, created: 1});
});
test('separate simultaneous tokens retain their own immutable request identities', async () => {
  const f = fixture();
  const results = await Promise.all([f.process(request()), f.process(request({headers: {'idempotency-key': token2}}))]);
  for (const result of results) await expect(result, 200, {state: 'stored-confirmed'});
  assert.equal(f.values.size, 2);
  assert.equal(new Set([...f.values.values()].map(value => value.request_id)).size, 2);
});
test('factory snapshots mutable configuration and secret while preserving trusted callback receivers', async () => {
  const f = fixture();
  f.config.allowedOrigin = 'https://changed.example.test'; f.config.noticeVersion = 'changed';
  f.config.secret.fill(7); f.config.openStore = () => assert.fail('changed callback');
  await expect(await f.process(request()), 200, {state: 'stored-confirmed'});
  await expect(await f.process(request()), 200, {state: 'stored-confirmed'});
  assert.equal(f.values.size, 1);
  const process = createPilotInterestProcessor(configuration({openStore: () => ({
    marker: true, create(record) { assert.equal(this.marker, true); return {state: 'stored-confirmed', request_id: record.request_id, created: true}; }
  })}));
  await expect(await process(request()), 200, {state: 'stored-confirmed'});
});
test('factory rejects invalid trusted configuration with one generic message and no lazy callbacks', () => {
  const cases = [undefined, null, {}, configuration({allowedOrigin: 'http://pilot.example.test'}),
    configuration({noticeVersion: 'private notice!'}), configuration({secret: new Uint8Array(31)}),
    configuration({now: 'private clock'}), configuration({openStore: false}),
    {get allowedOrigin() { throw new Error('private config'); }}];
  const revoked = Proxy.revocable({}, {}); revoked.revoke(); cases.push(revoked.proxy);
  for (const input of cases) {
    assert.throws(() => createPilotInterestProcessor(input),
      {name: 'TypeError', message: 'Unsupported pilot-interest processor configuration'});
  }
});
test('shared storage deadline bounds stalled initialization and dispatched writes without late success', async () => {
  let releaseOpen, releaseWrite, lateCreates = 0;
  const pendingOpen = new Promise(resolve => { releaseOpen = resolve; });
  const pendingWrite = new Promise(resolve => { releaseWrite = resolve; });
  const opening = createPilotInterestProcessor(configuration({openStore: () => pendingOpen}));
  const writing = createPilotInterestProcessor(configuration({openStore: () => ({create: () => pendingWrite})}));
  const results = await Promise.all([opening(request()), writing(request())]);
  await expect(results[0], 503, {state: 'unavailable'});
  await expect(results[1], 202, {state: 'received-unverified'});
  releaseOpen({create: () => { lateCreates++; return {state: 'conflict'}; }});
  releaseWrite({state: 'conflict'});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(lateCreates, 0);
});
