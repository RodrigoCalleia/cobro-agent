'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotInterestRetryId} = require('../server/pilot-interest-retry-id.cjs');
const {createPilotInterestRecordPreparer} = require('../server/prepare-pilot-interest-record.cjs');
const {createPilotInterestStore} = require('../server/pilot-interest-store.cjs');

const tokenA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const tokenB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const secretA = Uint8Array.from({length: 32}, (_, index) => index + 1);
const secretB = Uint8Array.from({length: 32}, (_, index) => 255 - index);
const request = token => new Request('https://example.invalid/interest', {
  method: 'POST',
  headers: token === undefined ? {} : {'idempotency-key': token},
  body: '{}'
});

test('same canonical client token and secret derive one opaque UUID v4', () => {
  const derive = createPilotInterestRetryId({secret: secretA});
  const first = derive(request(tokenA));
  const second = derive(request(tokenA));
  assert.deepEqual(second, first);
  assert.match(first.request_id, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u);
  assert.equal(first.request_id.includes('aaaaaaaa'), false);
});

test('different tokens and secrets produce different request identities', () => {
  const withA = createPilotInterestRetryId({secret: secretA});
  const withB = createPilotInterestRetryId({secret: secretB});
  assert.notEqual(withA(request(tokenA)).request_id, withA(request(tokenB)).request_id);
  assert.notEqual(withA(request(tokenA)).request_id, withB(request(tokenA)).request_id);
});

test('configuration copies at least 32 bytes of runtime secret', () => {
  const mutable = Uint8Array.from(secretA);
  const derive = createPilotInterestRetryId({secret: mutable});
  const before = derive(request(tokenA));
  mutable.fill(0);
  assert.deepEqual(derive(request(tokenA)), before);
});

test('missing, short and unsupported secrets fail generically', () => {
  for (const secret of [undefined, null, 'secret', new Uint8Array(31), {}, []]) {
    assert.throws(() => createPilotInterestRetryId({secret}), error => {
      assert.equal(error.message, 'Unsupported retry identity configuration');
      return true;
    });
  }
  const spoofed = new Uint8Array(1);
  Object.defineProperty(spoofed, 'byteLength', {value: 32});
  assert.throws(() => createPilotInterestRetryId({secret: spoofed}), {
    message: 'Unsupported retry identity configuration'
  });
  for (const configuration of [
    new Proxy({}, {get() { throw new Error('private getter'); }}),
    (() => { const {proxy, revoke} = Proxy.revocable({}, {}); revoke(); return proxy; })()
  ]) {
    assert.throws(() => createPilotInterestRetryId(configuration), error => {
      assert.equal(error.message, 'Unsupported retry identity configuration');
      assert.equal(error.message.includes('private'), false);
      return true;
    });
  }
});

test('missing and noncanonical idempotency headers fail without echoing input', () => {
  const derive = createPilotInterestRetryId({secret: secretA});
  for (const token of [undefined, '', tokenA.toUpperCase(), 'not-a-token',
    'aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa', tokenA+','+tokenB]) {
    assert.deepEqual(derive(request(token)), {ok: false, code: 'invalid_idempotency_key'});
  }
});

test('non-Request input fails without touching crypto or a body', () => {
  const derive = createPilotInterestRetryId({secret: secretA});
  assert.deepEqual(derive({headers: {get: () => {throw new Error('private');}}}), {
    ok: false, code: 'invalid_idempotency_key'
  });
  const input = request(tokenA);
  assert.equal(derive(input).ok, true);
  assert.equal(input.bodyUsed, false);
  const {proxy, revoke} = Proxy.revocable(input, {});
  revoke();
  assert.deepEqual(derive(proxy), {ok: false, code: 'invalid_idempotency_key'});
});

test('derived identity integrates with metadata and confirms a later retry', async () => {
  const derive = createPilotInterestRetryId({secret: secretA});
  const requestId = derive(request(tokenA)).request_id;
  let second = false;
  const prepare = createPilotInterestRecordPreparer({
    noticeVersion: 'synthetic-v1',
    generateId: () => requestId,
    now: () => new Date(second ? '2026-10-07T12:01:00.000Z' : '2026-10-07T12:00:00.000Z')
  });
  const values = new Map();
  const provider = {
    async setJSON(key, value) {
      if (values.has(key)) return {modified: false};
      values.set(key, structuredClone(value)); return {modified: true};
    },
    async get(key) { return values.has(key) ? structuredClone(values.get(key)) : null; },
    async delete(key) { values.delete(key); }
  };
  const store = createPilotInterestStore({environment: 'test', getStore: () => provider});
  const payload = {contact_email: 'synthetic@example.invalid', contact_permission: true};
  assert.equal((await store.create(prepare(payload).value)).created, true);
  second = true;
  assert.deepEqual(await store.create(prepare(payload).value), {
    state: 'stored-confirmed', request_id: requestId, created: false
  });
  assert.equal(values.size, 1);
  assert.equal([...values.values()][0].received_at, '2026-10-07T12:00:00.000Z');
});

test('same retry identity with changed contact remains a conflict', async () => {
  const requestId = createPilotInterestRetryId({secret: secretA})(request(tokenA)).request_id;
  const prepare = createPilotInterestRecordPreparer({
    noticeVersion: 'synthetic-v1',
    generateId: () => requestId,
    now: () => new Date('2026-10-07T12:00:00.000Z')
  });
  const values = new Map();
  const provider = {
    async setJSON(key, value) {
      if (values.has(key)) return {modified: false};
      values.set(key, structuredClone(value)); return {modified: true};
    },
    async get(key) { return structuredClone(values.get(key)); },
    async delete() {}
  };
  const store = createPilotInterestStore({environment: 'test', getStore: () => provider});
  await store.create(prepare({contact_email: 'first@example.invalid', contact_permission: true}).value);
  assert.deepEqual(await store.create(prepare({contact_email: 'second@example.invalid', contact_permission: true}).value), {
    state: 'conflict'
  });
});
