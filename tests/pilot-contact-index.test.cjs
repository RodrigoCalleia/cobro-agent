'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotContactIndex, normalizePilotContact} = require('../server/pilot-contact-index.cjs');

const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';

function fixture() {
  const data = new Map();
  const seen = [];
  const index = createPilotContactIndex({
    deriveToken: async value => {
      seen.push(value);
      return 'a'.repeat(64);
    },
    read: async token => data.get(token),
    update: async (token, updater) => {
      const value = updater(data.get(token));
      if (value !== undefined) data.set(token, value);
      return value === undefined ? data.get(token) : value;
    }
  });
  return {data, seen, index};
}

test('normalizes contact for derivation without changing stored identity', () => {
  assert.equal(normalizePilotContact('  User@Example.COM '), 'user@example.com');
});

test('adds multiple opaque request IDs under one derived token', async () => {
  const {index, data, seen} = fixture();
  assert.deepEqual((await index.add('User@Example.com', id1)).requestIds, [id1]);
  assert.deepEqual((await index.add(' user@example.COM ', id2)).requestIds, [id1, id2]);
  assert.deepEqual((await index.find('USER@example.com')).requestIds, [id1, id2]);
  assert.deepEqual([...data.values()], [[id1, id2]]);
  assert.deepEqual(seen, ['user@example.com', 'user@example.com', 'user@example.com']);
});

test('re-adding an ID is idempotent and does not duplicate the record', async () => {
  let writes = 0;
  const store = new Map();
  const wrapped = createPilotContactIndex({
    deriveToken: async () => 'b'.repeat(64),
    read: async token => store.get(token),
    update: async (token, updater) => {
      const value = updater(store.get(token));
      if (value !== undefined) {
        writes += 1;
        store.set(token, value);
      }
      return value === undefined ? store.get(token) : value;
    }
  });
  await wrapped.add('user@example.com', id1);
  await wrapped.add('user@example.com', id1);
  assert.equal(writes, 1);
  assert.deepEqual((await wrapped.find('user@example.com')).requestIds, [id1]);
});

test('rejects malformed contacts, IDs and corrupted stored values', async () => {
  const {index} = fixture();
  await assert.rejects(() => index.add('not-an-email', id1), /contact is invalid/);
  await assert.rejects(() => index.add('user@example.com', 'not-an-id'), /request ID is invalid/);
  const broken = createPilotContactIndex({
    deriveToken: async () => 'c'.repeat(64),
    read: async () => ['raw-email@example.com'],
    update: async () => []
  });
  await assert.rejects(() => broken.find('user@example.com'), /stored index value is invalid/);
});

test('enforces a bounded number of IDs', async () => {
  const store = new Map();
  const index = createPilotContactIndex({
    maxIds: 1,
    deriveToken: async () => 'd'.repeat(64),
    read: async token => store.get(token),
    update: async (token, updater) => {
      const value = updater(store.get(token));
      store.set(token, value);
      return value;
    }
  });
  await index.add('user@example.com', id1);
  await assert.rejects(() => index.add('user@example.com', id2), /limit reached/);
});

test('atomic update retains simultaneous IDs instead of losing one', async () => {
  const store = new Map();
  const index = createPilotContactIndex({
    deriveToken: async () => 'e'.repeat(64),
    read: async token => store.get(token),
    update: async (token, updater) => {
      // This synchronous critical section models the provider's atomic update.
      const value = updater(store.get(token));
      store.set(token, value);
      return value;
    }
  });
  await Promise.all([
    index.add('user@example.com', id1),
    index.add('user@example.com', id2)
  ]);
  assert.deepEqual((await index.find('user@example.com')).requestIds, [id1, id2]);
});
