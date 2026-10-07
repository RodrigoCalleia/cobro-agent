'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotInterestPreflight} = require('../server/pilot-interest-preflight.cjs');
const {readPilotInterest} = require('../server/read-pilot-interest.cjs');
const allowedOrigin = 'https://cobro-agent-rodrigo.netlify.app';
const makeRequest = (origin = allowedOrigin, method = 'POST', headers = {}) => new Request(`${allowedOrigin}/api/pilot-interest`, {
  method,
  headers: {...(origin === undefined ? {} : {origin}), ...headers},
  ...(!['GET', 'HEAD'].includes(method) ? {body: '{}'} : {})
});
const preflight = () => createPilotInterestPreflight({allowedOrigin});

test('permits a POST from the single configured origin without consuming its body', () => {
  const input = makeRequest();
  assert.deepEqual(preflight()(input), {ok: true});
  assert.equal(input.bodyUsed, false);
});

test('rejects unsupported methods before checking origin or reading a body', () => {
  const check = preflight();
  for (const method of ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    const input = makeRequest('https://other.invalid', method);
    assert.deepEqual(check(input), {ok: false, code: 'method_not_allowed'});
    assert.equal(input.bodyUsed, false);
  }
});

test('missing, null and empty Origin values fail without fallback to URL or Host', () => {
  const check = preflight();
  for (const origin of ['null', '']) {
    const input = makeRequest(origin, 'POST', {host: 'cobro-agent-rodrigo.netlify.app'});
    assert.deepEqual(check(input), {ok: false, code: 'origin_not_allowed'});
    assert.equal(input.bodyUsed, false);
  }
  const missing = makeRequest(); missing.headers.delete('origin');
  assert.deepEqual(check(missing), {ok: false, code: 'origin_not_allowed'});
});

test('requires exact normalized Origin header, rejecting aliases and deceptive spellings', () => {
  const check = preflight();
  for (const origin of [
    'http://cobro-agent-rodrigo.netlify.app',
    `${allowedOrigin}:444`, `${allowedOrigin}:443`, `${allowedOrigin}/`,
    'https://COBRO-AGENT-RODRIGO.netlify.app',
    `${allowedOrigin}.attacker.invalid`,
    `${allowedOrigin}@attacker.invalid`,
    `${allowedOrigin} https://other.invalid`,
    `${allowedOrigin}, ${allowedOrigin}`,
    'https://deploy-preview-7--cobro-agent-rodrigo.netlify.app'
  ]) {
    assert.deepEqual(check(makeRequest(origin)), {ok: false, code: 'origin_not_allowed'});
  }
  // WHATWG Headers trims surrounding HTTP whitespace before this boundary.
  assert.deepEqual(check(makeRequest(` ${allowedOrigin} `)), {ok: true});
});

test('appended duplicate Origin header is not accepted as one origin', () => {
  const input = makeRequest(); input.headers.append('origin', allowedOrigin);
  assert.deepEqual(preflight()(input), {ok: false, code: 'origin_not_allowed'});
});

test('forwarded headers cannot grant a disallowed origin or method', () => {
  const spoofed = {
    host: 'cobro-agent-rodrigo.netlify.app',
    'x-forwarded-host': 'cobro-agent-rodrigo.netlify.app',
    'x-forwarded-proto': 'https',
    'x-forwarded-for': '192.0.2.1',
    forwarded: 'host=cobro-agent-rodrigo.netlify.app;proto=https',
    'x-http-method-override': 'POST'
  };
  assert.deepEqual(preflight()(makeRequest('https://other.invalid', 'POST', spoofed)), {
    ok: false, code: 'origin_not_allowed'
  });
  assert.deepEqual(preflight()(makeRequest(allowedOrigin, 'PUT', spoofed)), {
    ok: false, code: 'method_not_allowed'
  });
});

test('origin configuration is a canonical HTTPS origin, not a URL or client-derived value', () => {
  for (const value of [undefined, null, {}, '', 'null', 'http://example.invalid',
    `${allowedOrigin}/`, `${allowedOrigin}/path`, `${allowedOrigin}?x=1`,
    `${allowedOrigin}#x`, ` ${allowedOrigin}`, 'https://user:password@example.invalid',
    'https://EXAMPLE.invalid', 'https://example.invalid:443']) {
    assert.throws(() => createPilotInterestPreflight({allowedOrigin: value}), {
      message: 'Unsupported pilot-interest origin configuration'
    });
  }
  assert.deepEqual(createPilotInterestPreflight({allowedOrigin: 'https://example.invalid:8443'})(
    makeRequest('https://example.invalid:8443')
  ), {ok: true});
});

test('configuration getters, proxies and revoked objects fail with a generic error', () => {
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  for (const configuration of [null, revoked.proxy, new Proxy({}, {
    get() { throw new Error('private config detail'); }
  }), {get allowedOrigin() { throw new Error('private config detail'); }}]) {
    assert.throws(() => createPilotInterestPreflight(configuration), error => {
      assert.equal(error.message, 'Unsupported pilot-interest origin configuration');
      return true;
    });
  }
});

test('configuration is snapshotted and later mutations do not expand the allowlist', () => {
  const configuration = {allowedOrigin};
  const check = createPilotInterestPreflight(configuration);
  configuration.allowedOrigin = 'https://other.invalid';
  assert.deepEqual(check(makeRequest()), {ok: true});
  assert.deepEqual(check(makeRequest('https://other.invalid')), {ok: false, code: 'origin_not_allowed'});
});

test('non-native, Proxy and revoked inputs fail without reading overridden properties', () => {
  const revoked = Proxy.revocable(makeRequest(), {}); revoked.revoke();
  const fake = {get method() { assert.fail('must not access duck-typed method'); }};
  const trapped = new Proxy(makeRequest(), {
    get() { assert.fail('must not trigger proxy'); }
  });
  for (const input of [undefined, null, {}, fake, trapped, revoked.proxy]) {
    assert.deepEqual(preflight()(input), {ok: false, code: 'invalid_request'});
  }
});

test('native brand checking may trigger a Proxy prototype trap but does not expose its error', () => {
  let calls = 0;
  const input = new Proxy(makeRequest(), {
    getPrototypeOf() { calls++; throw new Error('private proxy detail'); }
  });
  assert.deepEqual(preflight()(input), {ok: false, code: 'invalid_request'});
  assert.equal(calls, 1);
});

test('overridden Request and Headers properties cannot spoof native values', () => {
  const input = makeRequest('https://other.invalid', 'PUT');
  Object.defineProperty(input, 'method', {get() { assert.fail('overridden method'); }});
  Object.defineProperty(input, 'headers', {get() { assert.fail('overridden headers'); }});
  assert.deepEqual(preflight()(input), {ok: false, code: 'method_not_allowed'});
  const badOrigin = makeRequest('https://other.invalid');
  badOrigin.headers.get = () => allowedOrigin;
  assert.deepEqual(preflight()(badOrigin), {ok: false, code: 'origin_not_allowed'});
});

test('preflight has no body, network, storage, metadata or payload-validation side effects', async t => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('network forbidden'));
  const input = makeRequest();
  assert.deepEqual(preflight()(input), {ok: true});
  assert.equal(input.bodyUsed, false);
  // Preflight acceptance alone does not imply field/permission acceptance.
  assert.equal((await readPilotInterest(input)).code, 'unsupported_media_type');
});

test('composes with bounded reader only after origin and method pass', async () => {
  const value = {contact_email: 'synthetic@example.invalid', contact_permission: true};
  const input = new Request(`${allowedOrigin}/api/pilot-interest`, {
    method: 'POST', headers: {origin: allowedOrigin, 'content-type': 'application/json'},
    body: JSON.stringify(value)
  });
  const check = preflight();
  assert.deepEqual(check(input), {ok: true});
  assert.deepEqual(await readPilotInterest(input), {ok: true, value});
  const blocked = makeRequest('https://other.invalid');
  let readerCalled = false;
  if (check(blocked).ok) { readerCalled = true; await readPilotInterest(blocked); }
  assert.equal(readerCalled, false);
  assert.equal(blocked.bodyUsed, false);
});
