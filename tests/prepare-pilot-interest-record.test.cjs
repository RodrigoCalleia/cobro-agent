'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotInterestRecordPreparer} = require('../server/prepare-pilot-interest-record.cjs');
const {createPilotInterestStore} = require('../server/pilot-interest-store.cjs');

const id = '22222222-2222-4222-8222-222222222222';
const received = new Date('2026-10-07T09:00:00.000Z');
const input = {contact_email: ' synthetic@example.invalid ', business_name: ' Ficticio ', contact_permission: true};
const factory = overrides => createPilotInterestRecordPreparer({
  noticeVersion: 'synthetic-notice-v1',
  generateId: () => id,
  now: () => received,
  ...overrides
});

test('normalizes permitted contact fields and adds only trusted metadata', () => {
  assert.deepEqual(factory()(input), {ok: true, value: {
    contact_email: 'synthetic@example.invalid',
    business_name: 'Ficticio',
    contact_permission: true,
    request_id: id,
    received_at: '2026-10-07T09:00:00.000Z',
    notice_version: 'synthetic-notice-v1'
  }});
});

test('supports the optional business name without inventing it', () => {
  const result = factory()({contact_email: 'synthetic@example.invalid', contact_permission: true});
  assert.equal(Object.hasOwn(result.value, 'business_name'), false);
});

test('rejects invalid contact input before generating metadata', () => {
  let idCalls = 0, clockCalls = 0;
  const prepare = factory({generateId: () => {idCalls++; return id;}, now: () => {clockCalls++; return received;}});
  const result = prepare({contact_email: 'invalid', contact_permission: false});
  assert.deepEqual(result, {ok: false, code: 'validation_failed', fields: ['contact_email', 'contact_permission']});
  assert.equal(idCalls, 0);
  assert.equal(clockCalls, 0);
});

test('client metadata and extra fields cannot override trusted values', () => {
  for (const extra of [
    {request_id: id},
    {received_at: received.toISOString()},
    {notice_version: 'other'},
    {remote_ip: '192.0.2.1'}
  ]) {
    const result = factory()({...input, ...extra});
    assert.deepEqual(result, {ok: false, code: 'validation_failed', fields: ['unexpected_fields']});
  }
});

test('notice version and dependencies are fixed by trusted factory configuration', () => {
  for (const noticeVersion of [undefined, '', 'UPPER', ' space', 'a'.repeat(65), 1]) {
    assert.throws(() => createPilotInterestRecordPreparer({noticeVersion}), /Unsupported trusted metadata configuration/);
  }
  assert.throws(() => createPilotInterestRecordPreparer({noticeVersion: 'v1', generateId: null}), /Unsupported trusted metadata configuration/);
  assert.throws(() => createPilotInterestRecordPreparer({noticeVersion: 'v1', now: null}), /Unsupported trusted metadata configuration/);
});

test('invalid or failed identifier generation fails without exposing details', () => {
  for (const generateId of [
    () => '../private',
    () => '22222222-2222-5222-8222-222222222222',
    () => Promise.resolve(id),
    () => {throw new Error('private-id-detail');}
  ]) {
    assert.throws(() => factory({generateId})(input), error => {
      assert.equal(error.message, 'Invalid trusted metadata');
      assert.equal(error.message.includes('private-id-detail'), false);
      return true;
    });
  }
});

test('rejected async metadata dependencies are drained without leaking rejection details', async () => {
  const privateId = Promise.reject(new Error('private-async-id-detail'));
  assert.throws(() => factory({generateId: () => privateId})(input), /Invalid trusted metadata/);
  const privateClock = Promise.reject(new Error('private-async-clock-detail'));
  assert.throws(() => factory({now: () => privateClock})(input), /Invalid trusted metadata/);
  await new Promise(resolve => setImmediate(resolve));
});

test('invalid or failed trusted clock fails generically', () => {
  for (const now of [
    () => '2026-10-07T09:00:00.000Z',
    () => new Date('invalid'),
    () => Promise.resolve(received),
    () => {throw new Error('private-clock-detail');}
  ]) {
    assert.throws(() => factory({now})(input), /Invalid trusted metadata/);
  }
});

test('record snapshots normalized input and the trusted instant', () => {
  const payload = structuredClone(input);
  const instant = new Date(received);
  const result = factory({now: () => instant})(payload);
  payload.contact_email = 'changed@example.invalid';
  instant.setUTCFullYear(2030);
  assert.equal(result.value.contact_email, 'synthetic@example.invalid');
  assert.equal(result.value.received_at, '2026-10-07T09:00:00.000Z');
});

test('uses intrinsic Date operations instead of injected instance methods', () => {
  const instant = new Date(received);
  instant.getTime = () => NaN;
  instant.toISOString = () => 'not-a-date';
  assert.equal(factory({now: () => instant})(input).value.received_at, '2026-10-07T09:00:00.000Z');
});

test('proxy and revoked clock values fail without exposing trap details', () => {
  const trapped = new Proxy(new Date(received), {
    getPrototypeOf() { throw new Error('private-clock-proxy-detail'); }
  });
  const revoked = Proxy.revocable(new Date(received), {});
  revoked.revoke();
  for (const value of [trapped, revoked.proxy]) {
    assert.throws(() => factory({now: () => value})(input), error => {
      assert.equal(error.message, 'Invalid trusted metadata');
      assert.equal(error.message.includes('private-clock'), false);
      assert.equal(error.message.includes('revoked'), false);
      return true;
    });
  }
});

test('payload access failures are generic and do not expose getter details', () => {
  const payload = {};
  Object.defineProperty(payload, 'contact_email', {
    enumerable: true,
    get() { throw new Error('private-getter-detail'); }
  });
  assert.throws(() => factory()(payload), error => {
    assert.equal(error.message, 'Invalid pilot interest payload');
    assert.equal(error.message.includes('private-getter-detail'), false);
    return true;
  });
});

test('separate preparations obtain separate server identifiers and times', () => {
  let sequence = 0;
  const ids = ['33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444'];
  const prepare = factory({
    generateId: () => ids[sequence],
    now: () => new Date(`2026-10-07T09:00:0${sequence++}.000Z`)
  });
  const first = prepare(input).value;
  const second = prepare(input).value;
  assert.notEqual(first.request_id, second.request_id);
  assert.notEqual(first.received_at, second.received_at);
});

test('prepared record is accepted by the existing guarded store without changing retry identity', async () => {
  const values = new Map();
  const store = {
    async setJSON(key, value) {
      if (values.has(key)) return {modified: false};
      values.set(key, structuredClone(value)); return {modified: true};
    },
    async get(key) { return values.has(key) ? structuredClone(values.get(key)) : null; },
    async delete(key) { values.delete(key); }
  };
  const adapter = createPilotInterestStore({environment: 'test', getStore: () => store});
  const record = factory()(input).value;
  assert.deepEqual(await adapter.create(record), {state: 'stored-confirmed', request_id: id, created: true});
  assert.deepEqual(await adapter.create(record), {state: 'stored-confirmed', request_id: id, created: false});
  assert.equal(values.size, 1);
});

test('default trusted generators produce the required metadata shapes', () => {
  const result = createPilotInterestRecordPreparer({noticeVersion: 'synthetic-v1'})({
    contact_email: 'synthetic@example.invalid',
    contact_permission: true
  });
  assert.match(result.value.request_id, /^[a-f0-9-]{36}$/u);
  assert.equal(new Date(result.value.received_at).toISOString(), result.value.received_at);
});
