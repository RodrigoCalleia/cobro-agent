'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotContactTokenDeriver} = require('../server/pilot-contact-token.cjs');

const activeSecret = Buffer.alloc(32, 0x11);
const previousSecret = Buffer.alloc(32, 0x22);

test('derives deterministic opaque tokens with the active key first', async () => {
  const deriver = createPilotContactTokenDeriver({
    active: {version: 'k2', secret: activeSecret},
    previous: [{version: 'k1', secret: previousSecret}]
  });
  const first = await deriver.deriveTokens('user@example.com');
  const second = await deriver.deriveTokens('user@example.com');
  assert.deepEqual(first, second);
  assert.equal(first.lookup.length, 2);
  assert.equal(first.active, first.lookup[0]);
  assert.ok(first.lookup.every(token => /^[a-f0-9]{64}$/u.test(token)));
  assert.notEqual(first.lookup[0], first.lookup[1]);
});

test('matches the fixed HMAC-SHA256 domain and version framing vector', async () => {
  const deriver = createPilotContactTokenDeriver({
    active: {version: 'k2', secret: activeSecret}
  });
  assert.equal(
    (await deriver.deriveTokens('user@example.com')).active,
    '0ba208d968e1a30bbb047fcaf0082d0906a38281158ed9d4d96e9a7a1b994b68'
  );
});

test('domain and key version separate tokens across contacts and rotations', async () => {
  const current = createPilotContactTokenDeriver({
    active: {version: 'k2', secret: activeSecret}
  });
  const renamed = createPilotContactTokenDeriver({
    active: {version: 'k3', secret: activeSecret}
  });
  const token = (await current.deriveTokens('user@example.com')).active;
  assert.notEqual(token, (await current.deriveTokens('other@example.com')).active);
  assert.notEqual(token, (await renamed.deriveTokens('user@example.com')).active);
});

test('supports the bounded three-version lookup order', async () => {
  const deriver = createPilotContactTokenDeriver({
    active: {version: 'k3', secret: Buffer.alloc(32, 0x33)},
    previous: [
      {version: 'k2', secret: Buffer.alloc(32, 0x22)},
      {version: 'k1', secret: Buffer.alloc(32, 0x11)}
    ]
  });
  const result = await deriver.deriveTokens('user@example.com');
  assert.equal(result.lookup.length, 3);
  assert.equal(result.active, result.lookup[0]);
  assert.equal(new Set(result.lookup).size, 3);
});

test('copies caller secret bytes before derivation', async () => {
  const mutable = Buffer.alloc(32, 0x33);
  const deriver = createPilotContactTokenDeriver({active: {version: 'k1', secret: mutable}});
  const before = (await deriver.deriveTokens('user@example.com')).active;
  mutable.fill(0x44);
  const after = (await deriver.deriveTokens('user@example.com')).active;
  assert.equal(after, before);
});

test('rejects weak, excessive, duplicate or malformed keyrings', () => {
  assert.throws(() => createPilotContactTokenDeriver({
    active: {version: 'k1', secret: Buffer.alloc(31)}
  }), /key is invalid/);
  assert.throws(() => createPilotContactTokenDeriver({
    active: {version: 'k1', secret: activeSecret},
    previous: [
      {version: 'k0', secret: previousSecret},
      {version: 'k-1', secret: Buffer.alloc(32, 0x33)},
      {version: 'k-2', secret: Buffer.alloc(32, 0x44)}
    ]
  }), /keyring is invalid/);
  assert.throws(() => createPilotContactTokenDeriver({
    active: {version: 'k1', secret: activeSecret},
    previous: [{version: 'k1', secret: previousSecret}]
  }), /versions must be unique/);
});

test('requires already-normalized input and never returns key versions or secrets', async () => {
  const deriver = createPilotContactTokenDeriver({
    active: {version: 'k2', secret: activeSecret},
    previous: [{version: 'k1', secret: previousSecret}]
  });
  await assert.rejects(() => deriver.deriveTokens(' User@Example.COM '), /must be normalized/);
  const result = await deriver.deriveTokens('user@example.com');
  assert.deepEqual(Object.keys(result), ['active', 'lookup']);
  assert.equal(JSON.stringify(result).includes('k1'), false);
  assert.equal(JSON.stringify(result).includes('k2'), false);
  assert.equal(JSON.stringify(result).includes(activeSecret.toString('hex')), false);
});
