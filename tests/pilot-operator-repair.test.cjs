'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotOperatorRepair} = require('../server/pilot-operator-repair.cjs');

const command = Object.freeze({
  schema_version: 'repair-command-v1',
  operation_id: '11111111-1111-4111-8111-111111111111',
  request_id: '22222222-2222-4222-8222-222222222222',
  action: 'contact-index.repair-one',
  environment: 'production',
  site_id: 'cobro-agent-rodrigo',
  reason_code: 'reconciliation-missing-membership',
  ticket_ref: 'reconciliation:synthetic-1',
  policy_version: 'operator-repair-v1'
});
const start = Date.parse('2026-10-09T15:00:00.000Z');
const authorization = Object.freeze({
  state: 'authorized',
  actor_ref: 'operator:synthetic',
  authorization_id: '33333333-3333-4333-8333-333333333333',
  issued_at: '2026-10-09T14:59:30.000Z',
  expires_at: '2026-10-09T15:01:00.000Z'
});
const claim = Object.freeze({
  state: 'claimed',
  claim_id: '44444444-4444-4444-8444-444444444444',
  claim_expires_at: '2026-10-09T15:00:30.000Z',
  request_id: command.request_id,
  actor_ref: authorization.actor_ref,
  policy_version: command.policy_version
});

function fixture(overrides = {}) {
  const calls = [];
  const audit = {
    async claim(entry) { calls.push(['claim', entry]); return claim; },
    async complete(entry) { calls.push(['complete', entry]); return {recorded: true}; }
  };
  const gate = createPilotOperatorRepair({
    authorize: async value => { calls.push(['authorize', value]); return authorization; },
    audit,
    repair: async requestId => {
      calls.push(['repair', requestId]);
      return {state: 'indexed-confirmed'};
    },
    environment: 'production',
    siteId: 'cobro-agent-rodrigo',
    policyVersion: 'operator-repair-v1',
    clock: () => start,
    ...overrides
  });
  return {gate, calls};
}

test('rejects schema, target, policy and free-text mismatches before authorization', async () => {
  const f = fixture();
  for (const value of [null, {}, {...command, reason_code: 'customer asked by email'},
    {...command, extra: true}, {...command, request_id: 'not-an-id'},
    {...command, action: 'contact-index.repair-all'}, {...command, environment: 'preview'},
    {...command, site_id: 'another-site'}, {...command, policy_version: 'old-policy'}]) {
    assert.deepEqual(await f.gate.execute(value), {state: 'rejected'});
  }
  assert.deepEqual(f.calls, []);
});

test('denied, malformed, future and expired authorizations cannot claim or repair', async () => {
  for (const [decision, expected] of [
    [{state: 'denied'}, {state: 'rejected'}],
    [{state: 'authorized'}, {state: 'unverified'}],
    [{...authorization, issued_at: '2026-10-09T15:00:01.000Z'}, {state: 'rejected'}],
    [{...authorization, expires_at: '2026-10-09T15:00:00.000Z'}, {state: 'rejected'}],
    [{...authorization, expires_at: '2026-10-09T16:00:00.000Z'}, {state: 'rejected'}]
  ]) {
    const calls = [];
    const f = fixture({authorize: async () => { calls.push('authorize'); return decision; }});
    assert.deepEqual(await f.gate.execute(command), expected);
    assert.deepEqual(calls, ['authorize']);
    assert.equal(f.calls.length, 0);
  }
});

test('claims one operation, repairs one ID and records only opaque metadata', async () => {
  const f = fixture();
  assert.deepEqual(await f.gate.execute(command), {
    state: 'completed', outcome: 'indexed-confirmed'
  });
  assert.deepEqual(f.calls.map(item => item[0]), ['authorize', 'claim', 'repair', 'complete']);
  const started = f.calls[1][1];
  assert.deepEqual(Reflect.ownKeys(started), [
    'schema_version', 'event', 'operation_id', 'request_id', 'action', 'environment',
    'site_id', 'reason_code', 'ticket_ref', 'policy_version', 'actor_ref',
    'authorization_id', 'authorization_expires_at', 'server_at'
  ]);
  assert.equal(JSON.stringify(f.calls).includes('@'), false);
  assert.equal(JSON.stringify(f.calls).includes('secret'), false);
  assert.deepEqual(f.calls[3][1], {
    schema_version: 'repair-audit-v1', event: 'completed',
    operation_id: command.operation_id, claim_id: claim.claim_id,
    outcome: 'indexed-confirmed',
    server_at: '2026-10-09T15:00:00.000Z'
  });
});

test('completed claim returns its durable terminal outcome without another repair', async () => {
  let repairs = 0;
  const f = fixture({
    audit: {
      async claim() { return {
        state: 'completed', outcome: 'suppressed', request_id: command.request_id,
        actor_ref: authorization.actor_ref, policy_version: command.policy_version
      }; },
      async complete() { throw new Error('must not complete twice'); }
    },
    repair: async () => { repairs += 1; return {state: 'indexed-confirmed'}; }
  });
  assert.deepEqual(await f.gate.execute(command), {state: 'completed', outcome: 'suppressed'});
  assert.equal(repairs, 0);
});

test('started operation can reacquire an exclusive claim after a terminal audit failure', async () => {
  let claims = 0;
  let repairs = 0;
  let completions = 0;
  const audit = {
    async claim() {
      claims += 1;
      return {...claim, claim_id: claims === 1 ? claim.claim_id :
        '55555555-5555-4555-8555-555555555555'};
    },
    async complete() {
      completions += 1;
      if (completions === 1) return {recorded: false};
      return {recorded: true};
    }
  };
  const f = fixture({audit, repair: async () => {
    repairs += 1;
    return {state: 'indexed-confirmed'};
  }});
  assert.deepEqual(await f.gate.execute(command), {state: 'unverified'});
  assert.deepEqual(await f.gate.execute(command), {state: 'completed', outcome: 'indexed-confirmed'});
  assert.equal(repairs, 2);
  assert.equal(completions, 2);
});

test('claim uncertainty never starts repair or claims completion', async () => {
  let repairs = 0;
  for (const claim of [
    async () => { throw new Error('synthetic claim failure'); },
    async () => ({state: 'busy'}),
    async () => ({state: 'unknown'}),
    async () => ({state: 'completed', outcome: 'invented'})
  ]) {
    const f = fixture({
      audit: {claim, complete: async () => ({recorded: true})},
      repair: async () => { repairs += 1; return {state: 'indexed-confirmed'}; }
    });
    assert.deepEqual(await f.gate.execute(command), {state: 'unverified'});
  }
  assert.equal(repairs, 0);
});

test('claim and terminal binding mismatches cannot target another request or actor', async () => {
  let repairs = 0;
  const wrongId = '99999999-9999-4999-8999-999999999999';
  for (const response of [
    {...claim, request_id: wrongId},
    {...claim, actor_ref: 'operator:another'},
    {state: 'completed', outcome: 'indexed-confirmed', request_id: wrongId,
      actor_ref: authorization.actor_ref, policy_version: command.policy_version}
  ]) {
    const f = fixture({
      audit: {claim: async () => response, complete: async () => ({recorded: true})},
      repair: async () => { repairs += 1; return {state: 'indexed-confirmed'}; }
    });
    assert.deepEqual(await f.gate.execute(command), {state: 'unverified'});
  }
  assert.equal(repairs, 0);
});

test('concurrent replay receives busy and cannot start a second repair', async () => {
  let finishRepair;
  let claims = 0;
  let repairs = 0;
  const audit = {
    async claim() {
      claims += 1;
      return claims === 1 ? claim : {state: 'busy'};
    },
    async complete() { return {recorded: true}; }
  };
  const f = fixture({
    audit,
    repair: async () => {
      repairs += 1;
      return new Promise(resolve => { finishRepair = resolve; });
    }
  });
  const first = f.gate.execute(command);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(await f.gate.execute(command), {state: 'unverified'});
  assert.equal(repairs, 1);
  finishRepair({state: 'indexed-confirmed'});
  assert.deepEqual(await first, {state: 'completed', outcome: 'indexed-confirmed'});
});

test('repair errors and malformed outcomes are recorded as unverified', async () => {
  for (const repair of [
    async () => { throw new Error('synthetic provider failure'); },
    async () => ({state: 'missing'}),
    async () => ({state: 'suppressed', detail: 'must-not-pass'})
  ]) {
    const events = [];
    const f = fixture({
      audit: {
        async claim() { return claim; },
        async complete(entry) { events.push(entry); return {recorded: true}; }
      },
      repair
    });
    assert.deepEqual(await f.gate.execute(command), {state: 'completed', outcome: 'unverified'});
    assert.equal(events[0].outcome, 'unverified');
  }
});

test('expiration while claim is pending skips repair and leaves the start for recovery', async () => {
  const times = [start, start, start, start + 61000, start + 61000];
  let repairs = 0;
  const completed = [];
  const f = fixture({
    clock: () => times.shift() ?? start + 61000,
    audit: {
      async claim() { return claim; },
      async complete(entry) { completed.push(entry); return {recorded: true}; }
    },
    repair: async () => { repairs += 1; return {state: 'indexed-confirmed'}; }
  });
  assert.deepEqual(await f.gate.execute(command), {state: 'unverified'});
  assert.equal(repairs, 0);
  assert.equal(completed.length, 0);
});

test('repair finishing after claim expiry cannot write a stale terminal event', async () => {
  const times = [start, start, start, start, start + 31000];
  let completions = 0;
  const f = fixture({
    clock: () => times.shift() ?? start + 31000,
    audit: {
      async claim() { return claim; },
      async complete() { completions += 1; return {recorded: true}; }
    }
  });
  assert.deepEqual(await f.gate.execute(command), {state: 'unverified'});
  assert.equal(completions, 0);
});

test('accessor-backed input and authorization cannot change after validation', async () => {
  let ticketReads = 0;
  const accessorCommand = {...command};
  Object.defineProperty(accessorCommand, 'ticket_ref', {
    enumerable: true,
    get() { ticketReads += 1; return ticketReads === 1 ? command.ticket_ref : 'private@example.com'; }
  });
  const f = fixture();
  assert.deepEqual(await f.gate.execute(accessorCommand), {state: 'rejected'});
  assert.equal(ticketReads, 0);
  assert.deepEqual(f.calls, []);

  let actorReads = 0;
  const accessorAuthorization = {...authorization};
  Object.defineProperty(accessorAuthorization, 'actor_ref', {
    enumerable: true,
    get() { actorReads += 1; return actorReads === 1 ? authorization.actor_ref : 'private@example.com'; }
  });
  const g = fixture({authorize: async () => accessorAuthorization});
  assert.deepEqual(await g.gate.execute(command), {state: 'unverified'});
  assert.equal(actorReads, 0);
  assert.deepEqual(g.calls, []);
});

test('deadline checks stop later stages and preserve an opaque result', async () => {
  let checks = 0;
  let repairs = 0;
  let completions = 0;
  const f = fixture({
    check() { checks += 1; if (checks === 3) throw new Error('synthetic deadline'); },
    repair: async () => { repairs += 1; return {state: 'indexed-confirmed'}; },
    audit: {
      async claim() { return claim; },
      async complete() { completions += 1; return {recorded: true}; }
    }
  });
  assert.deepEqual(await f.gate.execute(command), {state: 'unverified'});
  assert.equal(repairs, 0);
  assert.equal(completions, 0);
});

test('configuration, audit objects and returned views are strict and frozen', async () => {
  for (const audit of [undefined, {}, {claim() {}}, {claim() {}, complete: true}]) {
    assert.throws(() => createPilotOperatorRepair({
      authorize() {}, audit, repair() {}, environment: 'production',
      siteId: 'cobro-agent-rodrigo', policyVersion: 'operator-repair-v1'
    }), /Unsupported operator repair configuration/);
  }
  const f = fixture();
  const result = await f.gate.execute(command);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(f.calls[0][1]), true);
  assert.equal(Object.isFrozen(f.calls[1][1]), true);
  assert.equal(Object.isFrozen(f.calls[3][1]), true);
});
