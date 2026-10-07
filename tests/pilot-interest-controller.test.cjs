'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const {createPilotInterestController} = require('../client/pilot-interest-controller.js');
const first = '00000000-0000-4000-8000-000000000001';
const second = '00000000-0000-4000-8000-000000000002';
const draft = (extra = {}) => ({contact_email: 'synthetic@example.test', business_name: 'Fictional Agency', contact_permission: true, ...extra});
const saved = () => ({status: 200, body: {state: 'stored-confirmed'}});
const unverified = () => ({status: 202, body: {state: 'received-unverified'}});
const deferred = () => {let resolve; const promise = new Promise(r => {resolve = r;}); return {promise, resolve};};
function configured(transport, extra = {}) {
  const controller = createPilotInterestController({noticeVersion: 'pilot-v1', transport, generateToken: () => first, ...extra});
  controller.setDraft(draft()); return controller;
}

test('browser classic script has a dependency-free factory without module or require', async () => {
  const context = vm.createContext({AbortController, setTimeout, clearTimeout, performance, crypto});
  vm.runInContext(fs.readFileSync(require.resolve('../client/pilot-interest-controller.js'), 'utf8'), context);
  assert.equal(typeof context.createPilotInterestController, 'function');
  assert.equal(await vm.runInContext(`(() => {
    const c = createPilotInterestController({noticeVersion:'pilot-v1', transport:async()=>({status:200,body:{state:'stored-confirmed'}})});
    c.setDraft({contact_email:'synthetic@example.test',business_name:'Fictional Agency',contact_permission:true});
    return c.submit().then(s=>s.state);
  })()`, context), 'stored-confirmed');
});

test('configuration needs explicit transport and bounded notice/deadline', () => {
  for (const extra of [{transport: undefined}, {noticeVersion: 'UPPER'}, {noticeVersion: 'x'.repeat(65)},
    {timeoutMs: 0}, {timeoutMs: 15001}, {timeoutMs: Infinity}, {generateToken: null}]) {
    const config = {noticeVersion: 'pilot-v1', transport: async () => saved(), ...extra};
    if (extra.generateToken === null) { // null deliberately means default, per configuration contract.
      assert.doesNotThrow(() => createPilotInterestController(config));
    } else assert.throws(() => createPilotInterestController(config), /Unsupported pilot-interest controller configuration/);
  }
});

test('exact confirmation, frozen request snapshots, public state contains no input or identity', async () => {
  let captured;
  const c = configured(async request => {captured = request; return saved();});
  assert.deepEqual(await c.submit(), {state: 'stored-confirmed', code: null, noticeRequiresDecision: false, canSubmit: false});
  assert.equal(Object.isFrozen(captured), true);
  assert.equal(Object.isFrozen(captured.headers), true);
  assert.equal(captured.headers['Idempotency-Key'], first);
  assert.equal(captured.headers['Pilot-Notice-Version'], 'pilot-v1');
  assert.deepEqual(JSON.parse(captured.body), draft());
  assert.equal(Object.isFrozen(c.getState()), true);
  assert.deepEqual(Object.keys(c.getState()), ['state', 'code', 'noticeRequiresDecision', 'canSubmit']);
  assert.doesNotMatch(JSON.stringify(c.getState()), /synthetic|Fictional|00000000|pilot-v1/);
});

test('only exact HTTP200 confirmation schema can confirm storage', async () => {
  const bad = [
    {status: 201, body: {state: 'stored-confirmed'}}, {status: 202, body: {state: 'stored-confirmed'}},
    {status: 200, body: {state: 'received-unverified'}}, {status: '200', body: {state: 'stored-confirmed'}},
    {status: 200, body: {state: 'stored-confirmed', email: 'private'}},
    {status: 200, body: Object.create({state: 'stored-confirmed'})},
    {status: 200, body: '{"state":"stored-confirmed"}'},
    {status: 200, body: {state: 'stored-confirmed'}, secret: 'private'}, null
  ];
  for (const result of bad) {
    const c = configured(async () => result);
    assert.equal((await c.submit()).state, 'received-unverified');
  }
});

test('recognized failures require exact status and allowlisted code; raw errors never leak', async () => {
  for (const [status, body, expected, expectedCode] of [
    [202, {state: 'received-unverified'}, 'received-unverified', null],
    [503, {state: 'unavailable'}, 'failed', 'unavailable'],
    [409, {state: 'conflict'}, 'rejected', 'conflict'],
    [400, {state: 'rejected', code: 'validation_failed'}, 'rejected', 'validation_failed'],
    [415, {state: 'rejected', code: 'unsupported_media_type'}, 'rejected', 'unsupported_media_type'],
    [400, {state: 'rejected', code: 'private-provider-message'}, 'received-unverified', 'response_unrecognized'],
    [200, {state: 'rejected', code: 'validation_failed'}, 'received-unverified', 'response_unrecognized']
  ]) {
    const c = configured(async () => ({status, body})); const state = await c.submit();
    assert.equal(state.state, expected); assert.equal(state.code, expectedCode);
    assert.doesNotMatch(JSON.stringify(state), /private-provider-message/);
  }
});

test('manual unchanged retry reuses one UUID without automatic retry', async () => {
  const requests = []; let generated = 0;
  const c = configured(async r => {requests.push(r); return unverified();}, {generateToken: () => {generated++; return first;}});
  await c.submit(); await Promise.resolve(); assert.equal(requests.length, 1);
  c.setDraft(draft()); await c.submit();
  assert.equal(requests.length, 2); assert.equal(generated, 1);
  assert.equal(requests[0].body, requests[1].body);
  assert.equal(requests[0].headers['Idempotency-Key'], requests[1].headers['Idempotency-Key']);
});

test('every changed exact draft gets a fresh token including edit away and back', async () => {
  const requests = []; const tokens = [first, second];
  const c = configured(async r => {requests.push(r); return unverified();}, {generateToken: () => tokens.shift()});
  await c.submit(); c.setDraft(draft({business_name: 'Different Fictional'})); c.setDraft(draft()); await c.submit();
  assert.equal(requests[0].body, requests[1].body);
  assert.notEqual(requests[0].headers['Idempotency-Key'], requests[1].headers['Idempotency-Key']);
});

test('draft copies primitive data, rejects extras/objects and never guesses normalization', async () => {
  let request;
  const c = configured(async r => {request = r; return unverified();});
  const input = draft({contact_email: ' synthetic@example.test '}); c.setDraft(input); input.business_name = 'Mutated';
  await c.submit(); assert.equal(JSON.parse(request.body).business_name, 'Fictional Agency');
  assert.equal(JSON.parse(request.body).contact_email, ' synthetic@example.test ');
  for (const value of [draft({unexpected: true}), draft({business_name: {toString: () => 'x'}}),
    draft({contact_permission: 'true'}), draft({business_name: 'x'.repeat(101)}), draft({contact_email: 'x'.repeat(255)})]) {
    assert.throws(() => c.setDraft(value), /Invalid pilot-interest draft/);
  }
});

test('no submission without affirmative permission or nonempty contact', async () => {
  let calls = 0; const c = configured(async () => {calls++; return saved();});
  c.setDraft(draft({contact_permission: false})); await c.submit();
  c.setDraft(draft({contact_email: '  '})); await c.submit(); assert.equal(calls, 0);
});

test('double submit cannot dispatch twice and saved state does not resend', async () => {
  const pending = deferred(); let calls = 0;
  const c = configured(() => {calls++; return pending.promise;}); const firstSubmit = c.submit();
  assert.equal((await c.submit()).state, 'submitting'); assert.equal(calls, 1);
  pending.resolve(saved()); await firstSubmit; await c.submit(); assert.equal(calls, 1);
});

test('notice mismatch locks old permission through edits/reset until explicit replacement', async () => {
  const requests = []; const tokens = [first, second];
  const c = configured(async r => {requests.push(r); return requests.length === 1 ?
    {status: 409, body: {state: 'rejected', code: 'notice_mismatch'}} : saved();}, {generateToken: () => tokens.shift()});
  assert.equal((await c.submit()).noticeRequiresDecision, true);
  c.setDraft(draft()); await c.submit(); assert.equal(requests.length, 1);
  c.reset(); c.setDraft(draft()); await c.submit(); assert.equal(requests.length, 1);
  c.replaceNotice('pilot-v2'); assert.equal(c.getState().canSubmit, false); await c.submit(); assert.equal(requests.length, 1);
  c.setDraft(draft()); await c.submit();
  assert.equal(requests[1].headers['Pilot-Notice-Version'], 'pilot-v2');
  assert.equal(requests[1].headers['Idempotency-Key'], second);
});

test('same-version notice replacement still clears permission and identity', async () => {
  const requests = []; const tokens = [first, second];
  const c = configured(async r => {requests.push(r); return unverified();}, {generateToken: () => tokens.shift()});
  await c.submit(); c.replaceNotice('pilot-v1'); await c.submit(); assert.equal(requests.length, 1);
  c.setDraft(draft()); await c.submit(); assert.equal(requests[1].headers['Idempotency-Key'], second);
});

test('edits abort old transport and late confirmation cannot overwrite editing state', async () => {
  const pending = deferred(); let request;
  const c = configured(r => {request = r; return pending.promise;}); const submission = c.submit();
  c.setDraft(draft({business_name: 'Different Fictional'})); assert.equal(request.signal.aborted, true);
  pending.resolve(saved()); await submission; assert.equal(c.getState().state, 'editing');
});

test('cancel after dispatch is unverified; unchanged retry keeps original token', async () => {
  const pending = deferred(); const requests = [];
  const c = configured(r => {requests.push(r); return requests.length === 1 ? pending.promise : saved();});
  const submission = c.submit(); assert.equal(c.cancel().state, 'received-unverified'); await submission;
  await c.submit(); assert.equal(requests[0].headers['Idempotency-Key'], requests[1].headers['Idempotency-Key']);
  pending.resolve(saved()); await Promise.resolve(); assert.equal(c.getState().state, 'stored-confirmed');
});

test('reset/dispose discard input; late result never confirms', async () => {
  for (const action of ['reset', 'dispose']) {
    const pending = deferred(); const c = configured(() => pending.promise); const submission = c.submit();
    c[action](); pending.resolve(saved()); await submission;
    assert.notEqual(c.getState().state, 'stored-confirmed'); assert.equal(c.getState().canSubmit, false);
    if (action === 'dispose') {
      assert.throws(() => c.setDraft(draft()), /disposed/); await assert.rejects(c.submit(), /disposed/);
    }
  }
});

test('transport throw/rejection becomes unverified and preserves manual retry token', async () => {
  const requests = [];
  const c = configured(r => {requests.push(r); throw new Error('private synthetic details');});
  assert.equal((await c.submit()).state, 'received-unverified'); await c.submit();
  assert.equal(requests[0].headers['Idempotency-Key'], requests[1].headers['Idempotency-Key']);
  assert.doesNotMatch(JSON.stringify(c.getState()), /private synthetic/);
});

test('deadline aborts hanging transport and late saved response is ignored', async () => {
  const pending = deferred(); let request;
  const c = configured(r => {request = r; return pending.promise;}, {timeoutMs: 15});
  const result = await c.submit(); assert.equal(result.state, 'received-unverified'); assert.equal(result.code, 'request_timeout');
  assert.equal(request.signal.aborted, true); pending.resolve(saved()); await Promise.resolve();
  assert.equal(c.getState().state, 'received-unverified');
});

test('token factory failures are generic and dispatch nothing', async () => {
  for (const generateToken of [() => 'INVALID', () => {throw new Error('private');}, () => Promise.reject(new Error('private'))]) {
    let calls = 0; const c = configured(async () => {calls++; return saved();}, {generateToken});
    assert.equal((await c.submit()).code, 'token_unavailable'); assert.equal(calls, 0);
  }
});

test('token callback reset/disposal cannot dispatch obsolete input', async () => {
  for (const action of ['reset', 'dispose']) {
    let c, calls = 0;
    c = configured(async () => {calls++; return saved();}, {generateToken: () => {c[action](); return first;}});
    await c.submit(); assert.equal(calls, 0); assert.equal(c.getState().canSubmit, false);
  }
});

test('throwing token factory cannot overwrite a nested active submission', async () => {
  let c, nested, generations = 0, dispatches = 0; const pending = deferred();
  c = configured(() => {dispatches++; return pending.promise;}, {generateToken: () => {
    if (++generations === 1) {nested = c.submit(); throw new Error('private');}
    return first;
  }});
  assert.equal((await c.submit()).state, 'submitting');
  assert.equal(c.getState().canSubmit, false); assert.equal(dispatches, 1);
  pending.resolve(saved()); assert.equal((await nested).state, 'stored-confirmed');
});

test('response getters cannot turn reentrant cancel/reset/disposal into confirmation', async () => {
  for (const action of ['cancel', 'reset', 'dispose']) {
    let c;
    c = configured(async () => ({status: 200, body: {get state() {c[action](); return 'stored-confirmed';}}}));
    await c.submit(); assert.notEqual(c.getState().state, 'stored-confirmed');
  }
});

test('final monotonic check rejects a confirmation whose getter blocks past deadline', async () => {
  const c = configured(async () => ({status: 200, body: {get state() {
    const end = performance.now() + 20; while (performance.now() < end) {} return 'stored-confirmed';
  }}}), {timeoutMs: 5});
  assert.equal((await c.submit()).state, 'received-unverified'); assert.equal(c.getState().code, 'request_timeout');
});

test('response schema getters throwing never leak or confirm', async () => {
  for (const result of [{get status() {throw new Error('private');}, body: {state: 'stored-confirmed'}},
    {status: 200, body: {get state() {throw new Error('private');}}}]) {
    const c = configured(async () => result); assert.equal((await c.submit()).state, 'received-unverified');
    assert.doesNotMatch(JSON.stringify(c.getState()), /private/);
  }
});

test('draft getter reentrancy cannot restore stale permission/contact after reset', () => {
  const c = configured(async () => saved());
  c.setDraft({get contact_email() {c.reset(); return 'synthetic@example.test';}, business_name: 'Fictional Agency', contact_permission: true});
  assert.equal(c.getState().canSubmit, false);
});
