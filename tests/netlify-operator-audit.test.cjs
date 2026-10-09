'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createNetlifyOperatorAudit, verifiedOperatorAuditFetch} =
  require('../server/netlify-operator-audit.cjs');
const {createPilotOperatorRepair} = require('../server/pilot-operator-repair.cjs');

const operationId = '11111111-1111-4111-8111-111111111111';
const requestId = '22222222-2222-4222-8222-222222222222';
const authorizationId = '33333333-3333-4333-8333-333333333333';
const claimIds = Array.from({length: 30}, (_, index) =>
  `aaaaaaaa-aaaa-4aaa-8aaa-${(index + 4).toString(16).padStart(12, '0')}`);
const base = Date.parse('2026-10-09T18:00:00.000Z');

function started(now = base, overrides = {}) {
  return {
    schema_version: 'repair-audit-v1', event: 'started', operation_id: operationId,
    request_id: requestId, action: 'contact-index.repair-one', environment: 'production',
    site_id: 'cobro-agent-rodrigo', reason_code: 'reconciliation-missing-membership',
    ticket_ref: 'reconciliation:synthetic-1', policy_version: 'operator-repair-v1',
    actor_ref: 'operator:synthetic', authorization_id: authorizationId,
    authorization_expires_at: new Date(now + 5 * 60 * 1000).toISOString(),
    server_at: new Date(now).toISOString(), ...overrides
  };
}

function completed(claimId, now = base, outcome = 'indexed-confirmed') {
  return {
    schema_version: 'repair-audit-v1', event: 'completed', operation_id: operationId,
    claim_id: claimId, outcome, server_at: new Date(now).toISOString()
  };
}

function fixture(options = {}) {
  const entries = new Map();
  const calls = [];
  let now = options.now ?? base;
  let etag = 0;
  let idIndex = 0;
  let casConflicts = options.casConflicts ?? 0;
  let writes = 0;
  const store = {
    async setJSON(key, value, condition) {
      writes += 1;
      calls.push(['setJSON', key, structuredClone(value), condition]);
      const current = entries.get(key);
      if (condition.onlyIfNew && current) return {modified: false};
      if (condition.onlyIfMatch) {
        if (casConflicts > 0) { casConflicts -= 1; return {modified: false}; }
        if (!current || current.etag !== condition.onlyIfMatch) return {modified: false};
      }
      if (options.advanceOnSetAt === writes) now += options.advanceOnSetBy;
      etag += 1;
      entries.set(key, {data: structuredClone(value), etag: `etag-${etag}`});
      return {etag: `etag-${etag}`, modified: true};
    },
    async getWithMetadata(key, readOptions) {
      calls.push(['getWithMetadata', key, readOptions]);
      const current = entries.get(key);
      return current ? {data: structuredClone(current.data), etag: current.etag, metadata: {}} : null;
    }
  };
  const audit = createNetlifyOperatorAudit({
    environment: 'production',
    clock: () => now,
    randomUUID: () => claimIds[idIndex++],
    getStore: config => {
      assert.deepEqual(config, {
        name: 'cobro-pilot-operator-audit-production-v1',
        consistency: 'strong', region: 'eu-central-1'
      });
      return store;
    }
  });
  return {audit, entries, calls, store, setNow(value) { now = value; }};
}

test('creates one CAS document, limits lease by authorization and appends terminal outcome', async () => {
  const f = fixture();
  const event = started(base, {
    authorization_expires_at: new Date(base + 30000).toISOString()
  });
  const claim = await f.audit.claim(event);
  assert.deepEqual(claim, {
    state: 'claimed', claim_id: claimIds[0],
    claim_expires_at: new Date(base + 30000).toISOString(), request_id: requestId,
    actor_ref: 'operator:synthetic', policy_version: 'operator-repair-v1'
  });
  assert.deepEqual(await f.audit.complete(completed(claim.claim_id)), {recorded: true});
  const stored = f.entries.get(`operations/${operationId}`).data;
  assert.equal(stored.events.length, 2);
  assert.deepEqual(stored.events.map(event => event.type), ['claimed', 'completed']);
  assert.equal(JSON.stringify(stored).includes('@'), false);
  assert.equal(JSON.stringify(stored).includes('secret'), false);
  assert.ok(f.calls.every(call => !['list', 'delete'].includes(call[0])));
});

test('a live claim makes concurrent replay busy without rewriting the document', async () => {
  const f = fixture();
  const first = await f.audit.claim(started());
  assert.equal(first.state, 'claimed');
  assert.deepEqual(await f.audit.claim(started()), {state: 'busy'});
  assert.equal(f.entries.get(`operations/${operationId}`).data.events.length, 1);
});

test('operation ID cannot be reused with another target, ticket or actor', async () => {
  const f = fixture();
  await f.audit.claim(started());
  for (const changed of [
    {request_id: '99999999-9999-4999-8999-999999999999'},
    {ticket_ref: 'reconciliation:another'},
    {actor_ref: 'operator:another'}
  ]) {
    await assert.rejects(f.audit.claim(started(base, changed)), /binding unverified/);
  }
  assert.equal(f.entries.get(`operations/${operationId}`).data.events.length, 1);
});

test('expired claim is recovered by one new authorization and old completion is rejected', async () => {
  const f = fixture();
  const first = await f.audit.claim(started());
  const later = base + 61000;
  f.setNow(later);
  const second = await f.audit.claim(started(later, {
    authorization_id: '99999999-9999-4999-8999-999999999999'
  }));
  assert.equal(second.state, 'claimed');
  assert.notEqual(second.claim_id, first.claim_id);
  assert.deepEqual(await f.audit.complete(completed(first.claim_id, later)), {recorded: false});
  assert.deepEqual(await f.audit.complete(completed(second.claim_id, later)), {recorded: true});
});

test('terminal replay is idempotent, conflicting outcome cannot replace it and claim reads it', async () => {
  const f = fixture();
  const claim = await f.audit.claim(started());
  assert.deepEqual(await f.audit.complete(completed(claim.claim_id)), {recorded: true});
  assert.deepEqual(await f.audit.complete(completed(claim.claim_id)), {recorded: true});
  assert.deepEqual(await f.audit.complete(completed(claim.claim_id, base, 'suppressed')),
    {recorded: false});
  assert.deepEqual(await f.audit.claim(started()), {
    state: 'completed', outcome: 'indexed-confirmed', request_id: requestId,
    actor_ref: 'operator:synthetic', policy_version: 'operator-repair-v1'
  });
});

test('CAS conflict retries are bounded and preserve one exclusive recovery claim', async () => {
  const f = fixture();
  await f.audit.claim(started());
  f.setNow(base + 61000);
  const key = `operations/${operationId}`;
  let conflicts = 1;
  const original = f.audit;
  const entry = f.entries.get(key);
  const wrapped = createNetlifyOperatorAudit({
    environment: 'production', clock: () => base + 61000,
    randomUUID: (() => { let i = 2; return () => claimIds[i++]; })(),
    getStore: () => ({
      async setJSON(storageKey, value, condition) {
        if (condition.onlyIfNew) return {modified: false};
        if (conflicts > 0) { conflicts -= 1; return {modified: false}; }
        if (condition.onlyIfMatch !== entry.etag) return {modified: false};
        entry.data = structuredClone(value); entry.etag = 'etag-recovered';
        return {etag: 'etag-recovered', modified: true};
      },
      async getWithMetadata() {
        return {data: structuredClone(entry.data), etag: entry.etag, metadata: {}};
      }
    })
  });
  const result = await wrapped.claim(started(base + 61000, {
    authorization_id: '99999999-9999-4999-8999-999999999999'
  }));
  assert.equal(result.state, 'claimed');
  assert.equal(entry.data.events.filter(event => event.type === 'claimed').length, 2);
  assert.ok(original);
});

test('completion fails closed when provider work crosses the exclusive lease', async () => {
  const f = fixture({advanceOnSetAt: 2, advanceOnSetBy: 61000});
  const claim = await f.audit.claim(started());
  await assert.rejects(f.audit.complete(completed(claim.claim_id)), /terminal unverified/);
});

test('successful writes require exact readback of the complete document', async () => {
  const entries = new Map();
  const audit = createNetlifyOperatorAudit({
    environment: 'production', clock: () => base, randomUUID: () => claimIds[0],
    getStore: () => ({
      async setJSON(key, value) {
        const changed = structuredClone(value);
        changed.events[0].authorization_id = '99999999-9999-4999-8999-999999999999';
        entries.set(key, changed);
        return {etag: 'changed', modified: true};
      },
      async getWithMetadata(key) {
        return {data: entries.get(key), etag: 'changed', metadata: {}};
      }
    })
  });
  await assert.rejects(audit.claim(started()), /write unverified/);
});

test('corrupt chronology and repeated fencing tokens fail closed', async () => {
  const f = fixture();
  await f.audit.claim(started());
  const key = `operations/${operationId}`;
  f.entries.get(key).data.events[0].claim_expires_at = new Date(base - 1).toISOString();
  await assert.rejects(f.audit.claim(started()), /document unverified/);

  const g = fixture();
  const first = await g.audit.claim(started());
  g.setNow(base + 61000);
  const repeated = createNetlifyOperatorAudit({
    environment: 'production', clock: () => base + 61000,
    randomUUID: () => first.claim_id, getStore: () => g.store
  });
  await assert.rejects(repeated.claim(started(base + 61000, {
    authorization_id: '99999999-9999-4999-8999-999999999999'
  })), /claim unverified/);
});

test('attempt limit and malformed provider state fail closed', async () => {
  const f = fixture();
  for (let index = 0; index < 8; index += 1) {
    const now = base + index * 61000;
    f.setNow(now);
    const result = await f.audit.claim(started(now, {
      authorization_id: `${String(index + 1).repeat(8)}-${String(index + 1).repeat(4)}-4${String(index + 1).repeat(3)}-8${String(index + 1).repeat(3)}-${String(index + 1).repeat(12)}`
    }));
    assert.equal(result.state, 'claimed');
  }
  const ninth = base + 8 * 61000;
  f.setNow(ninth);
  await assert.rejects(f.audit.claim(started(ninth)), /attempt limit/);

  const broken = createNetlifyOperatorAudit({
    environment: 'production', clock: () => base, randomUUID: () => claimIds[0],
    getStore: () => ({
      async setJSON() { return {modified: false}; },
      async getWithMetadata() { return {data: {state: 'corrupt'}, etag: 'x', metadata: {}}; }
    })
  });
  await assert.rejects(broken.claim(started()), /document unverified/);
});

test('accessors and invalid envelopes fail before storage without reading private values', async () => {
  const f = fixture();
  let reads = 0;
  const event = started();
  Object.defineProperty(event, 'ticket_ref', {
    enumerable: true,
    get() { reads += 1; return 'private@example.com'; }
  });
  await assert.rejects(f.audit.claim(event), TypeError);
  assert.equal(reads, 0);
  assert.equal(f.calls.length, 0);
});

test('verified transport accepts only explicit conditional-write outcomes', async () => {
  const seen = [];
  const transport = verifiedOperatorAuditFetch(async (_input, options) => {
    seen.push(options?.method ?? 'GET');
    return {status: options?.statusForTest ?? 200};
  });
  assert.equal((await transport('https://synthetic.invalid/read', {method: 'GET'})).status, 200);
  assert.equal((await transport('https://synthetic.invalid/write', {
    method: 'PUT', statusForTest: 200
  })).status, 200);
  assert.equal((await transport('https://synthetic.invalid/conflict', {
    method: 'PUT', statusForTest: 412
  })).status, 412);
  for (const statusForTest of [201, 204, 400, 403, 429, 500]) {
    await assert.rejects(transport('https://synthetic.invalid/write', {
      method: 'PUT', statusForTest
    }), /write unverified/);
  }
  assert.deepEqual(seen.slice(0, 3), ['GET', 'PUT', 'PUT']);
});

test('operator gate composes with the adapter using only synthetic collaborators', async () => {
  const f = fixture();
  const gate = createPilotOperatorRepair({
    audit: f.audit, environment: 'production', siteId: 'cobro-agent-rodrigo',
    policyVersion: 'operator-repair-v1', clock: () => base,
    authorize: async () => ({
      state: 'authorized', actor_ref: 'operator:synthetic', authorization_id: authorizationId,
      issued_at: new Date(base - 1000).toISOString(),
      expires_at: new Date(base + 30000).toISOString()
    }),
    repair: async value => {
      assert.equal(value, requestId);
      return {state: 'indexed-confirmed'};
    }
  });
  const result = await gate.execute({
    schema_version: 'repair-command-v1', operation_id: operationId, request_id: requestId,
    action: 'contact-index.repair-one', environment: 'production',
    site_id: 'cobro-agent-rodrigo', reason_code: 'reconciliation-missing-membership',
    ticket_ref: 'reconciliation:synthetic-1', policy_version: 'operator-repair-v1'
  });
  assert.deepEqual(result, {state: 'completed', outcome: 'indexed-confirmed'});
});
