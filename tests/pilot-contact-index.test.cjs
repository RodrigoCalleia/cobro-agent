'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotContactIndex, normalizePilotContact} = require('../server/pilot-contact-index.cjs');

const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';

function fixture() {
  const keys = new Set();
  const seen = [];
  const index = createPilotContactIndex({
    deriveToken: async value => {
      seen.push(value);
      return 'a'.repeat(64);
    },
    putIfNew: async key => {
      const modified = !keys.has(key);
      keys.add(key);
      return {modified};
    },
    listByPrefix: async prefix => [...keys].filter(key => key.startsWith(prefix))
  });
  return {keys, seen, index};
}

test('normalizes contact only before private token derivation', () => {
  assert.equal(normalizePilotContact('  User@Example.COM '), 'user@example.com');
});

test('stores multiple opaque IDs as separate membership keys', async () => {
  const {index, keys, seen} = fixture();
  assert.deepEqual(await index.add('User@Example.com', id1), {created: true});
  assert.deepEqual(await index.add(' user@example.COM ', id2), {created: true});
  assert.deepEqual((await index.find('USER@example.com')).requestIds, [id1, id2]);
  assert.deepEqual([...keys], [`${'a'.repeat(64)}/${id1}`, `${'a'.repeat(64)}/${id2}`]);
  assert.deepEqual(seen, ['user@example.com', 'user@example.com', 'user@example.com']);
});

test('re-adding an ID is idempotent through create-only membership', async () => {
  const {index, keys} = fixture();
  assert.deepEqual(await index.add('user@example.com', id1), {created: true});
  assert.deepEqual(await index.add('user@example.com', id1), {created: false});
  assert.equal(keys.size, 1);
  assert.deepEqual((await index.find('user@example.com')).requestIds, [id1]);
});

test('rejects malformed contacts, IDs, write results and listed keys', async () => {
  const {index} = fixture();
  await assert.rejects(() => index.add('not-an-email', id1), /contact is invalid/);
  await assert.rejects(() => index.add('user@example.com', 'not-an-id'), /request ID is invalid/);
  const brokenWrite = createPilotContactIndex({
    deriveToken: async () => 'b'.repeat(64),
    putIfNew: async () => ({modified: true, extra: true}),
    listByPrefix: async () => []
  });
  await assert.rejects(() => brokenWrite.add('user@example.com', id1), /write result is invalid/);
  const brokenList = createPilotContactIndex({
    deriveToken: async () => 'c'.repeat(64),
    putIfNew: async () => ({modified: true}),
    listByPrefix: async () => ['raw-email@example.com']
  });
  await assert.rejects(() => brokenList.find('user@example.com'), /listed index value is invalid/);
});

test('fails closed when listing exceeds the bounded processing limit', async () => {
  const prefix = `${'d'.repeat(64)}/`;
  const index = createPilotContactIndex({
    maxIds: 1,
    deriveToken: async () => 'd'.repeat(64),
    putIfNew: async () => ({modified: true}),
    listByPrefix: async () => [`${prefix}${id1}`, `${prefix}${id2}`]
  });
  await assert.rejects(() => index.find('user@example.com'), /listed index value is invalid/);
});

test('simultaneous IDs use different keys and neither can overwrite the other', async () => {
  const {index, keys} = fixture();
  await Promise.all([
    index.add('user@example.com', id1),
    index.add('user@example.com', id2)
  ]);
  assert.equal(keys.size, 2);
  assert.deepEqual((await index.find('user@example.com')).requestIds, [id1, id2]);
});

test('distinct normalized contacts remain isolated under different tokens', async () => {
  const keys = new Set();
  const index = createPilotContactIndex({
    deriveToken: async value => value.startsWith('first@') ? 'e'.repeat(64) : 'f'.repeat(64),
    putIfNew: async key => {
      const modified = !keys.has(key);
      keys.add(key);
      return {modified};
    },
    listByPrefix: async prefix => [...keys].filter(key => key.startsWith(prefix))
  });
  await index.add('first@example.com', id1);
  await index.add('second@example.com', id2);
  assert.deepEqual((await index.find('first@example.com')).requestIds, [id1]);
  assert.deepEqual((await index.find('second@example.com')).requestIds, [id2]);
});
