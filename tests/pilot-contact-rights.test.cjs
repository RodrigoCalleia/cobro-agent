'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotContactRightsPreparation} = require('../server/pilot-contact-rights.cjs');
const {createPilotContactTokenDeriver} = require('../server/pilot-contact-token.cjs');

const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';
const contact = 'pilot@example.test';
const activeSecret = Buffer.alloc(32, 0x22);
const previousSecret = Buffer.alloc(32, 0x11);

function record(id, email = contact) {
  return {
    contact_email: email,
    contact_permission: true,
    request_id: id,
    received_at: '2026-10-08T20:00:00.000Z',
    notice_version: 'synthetic-v1'
  };
}

function fixture() {
  const stores = new Map();
  const opened = [];
  function storeFor(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    const values = stores.get(name);
    return {
      async setJSON(key, value, options) {
        if (options?.onlyIfNew && values.has(key)) return {modified: false};
        values.set(key, structuredClone(value));
        return {modified: true};
      },
      async get(key) {
        return values.has(key) ? structuredClone(values.get(key)) : null;
      },
      async delete(key) { values.delete(key); },
      list({prefix, paginate}) {
        assert.equal(paginate, true);
        return {
          async *[Symbol.asyncIterator]() {
            yield {
              blobs: [...values.keys()].filter(key => key.startsWith(prefix)).map(key => ({key})),
              directories: []
            };
          }
        };
      }
    };
  }
  const getStore = options => {
    opened.push(options);
    return storeFor(options.name);
  };
  const rights = createPilotContactRightsPreparation({
    keyring: {
      active: {version: 'k2', secret: activeSecret},
      previous: [{version: 'k1', secret: previousSecret}]
    },
    getStore,
    environment: 'test',
    maxIds: 10
  });
  return {rights, stores, opened};
}

test('composes verified active memberships into a private multi-ID plan', async () => {
  const f = fixture();
  const records = f.stores.get('cobro-pilot-interest-test-v1');
  records.set(`requests/${id1}`, record(id1));
  records.set(`requests/${id2}`, record(id2));
  assert.deepEqual(await f.rights.indexStoredRequest(' Pilot@Example.TEST ', id1), {
    state: 'indexed-confirmed'
  });
  assert.deepEqual(await f.rights.indexStoredRequest(contact, id2), {
    state: 'indexed-confirmed'
  });
  assert.deepEqual(await f.rights.planSuppression(contact), {
    state: 'ready', requestIds: [id1, id2], alreadySuppressed: []
  });
  assert.deepEqual(f.opened.map(item => item.name), [
    'cobro-pilot-contact-index-test-v1',
    'cobro-pilot-interest-test-v1'
  ]);
  const indexValues = f.stores.get('cobro-pilot-contact-index-test-v1');
  assert.equal(JSON.stringify([...indexValues]).includes(contact), false);
});

test('finds retained previous-version memberships and separates suppressed records', async () => {
  const f = fixture();
  const records = f.stores.get('cobro-pilot-interest-test-v1');
  records.set(`requests/${id1}`, record(id1));
  records.set(`requests/${id2}`, {state: 'suppressed'});
  const previous = createPilotContactTokenDeriver({
    active: {version: 'k1', secret: previousSecret}
  });
  const oldToken = (await previous.deriveTokens(contact)).active;
  const memberships = f.stores.get('cobro-pilot-contact-index-test-v1');
  memberships.set(`members/${oldToken}/${id1}`, {state: 'member'});
  memberships.set(`members/${oldToken}/${id2}`, {state: 'member'});
  assert.deepEqual(await f.rights.planSuppression(contact), {
    state: 'ready', requestIds: [id1], alreadySuppressed: [id2]
  });
});

test('refuses to index a request before exact private record binding', async () => {
  const f = fixture();
  const records = f.stores.get('cobro-pilot-interest-test-v1');
  records.set(`requests/${id1}`, record(id1, 'other@example.test'));
  await assert.rejects(
    f.rights.indexStoredRequest(contact, id1),
    /Private record binding unverified/
  );
  assert.equal(f.stores.get('cobro-pilot-contact-index-test-v1').size, 0);
});

test('any mismatched binding fails the whole plan without partial IDs', async () => {
  const f = fixture();
  const records = f.stores.get('cobro-pilot-interest-test-v1');
  records.set(`requests/${id1}`, record(id1));
  records.set(`requests/${id2}`, record(id2));
  await f.rights.indexStoredRequest(contact, id1);
  await f.rights.indexStoredRequest(contact, id2);
  records.set(`requests/${id2}`, record(id2, 'other@example.test'));
  assert.deepEqual(await f.rights.planSuppression(contact), {state: 'unverified'});
});

test('planning performs no suppression or other request-store writes', async () => {
  const f = fixture();
  const records = f.stores.get('cobro-pilot-interest-test-v1');
  records.set(`requests/${id1}`, record(id1));
  await f.rights.indexStoredRequest(contact, id1);
  const before = structuredClone([...records]);
  await f.rights.planSuppression(contact);
  assert.deepEqual([...records], before);
});
