'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {validatePilotInterest: validate} = require('../server/validate-pilot-interest.cjs');
const valid = extra => ({contact_email: 'pilot@example.test', contact_permission: true, ...extra});

test('normalizes a valid synthetic request without claiming storage', () => {
  assert.deepEqual(validate(valid({contact_email: ' pilot+demo@example.test ', business_name: ' Equipo ficticio '})),
    {ok: true, value: {contact_email: 'pilot+demo@example.test', business_name: 'Equipo ficticio', contact_permission: true}});
});
test('business name is optional and remains literal text', () => {
  assert.equal(Object.hasOwn(validate(valid()).value, 'business_name'), false);
  assert.equal(validate(valid({business_name: '<b>Ficticio</b>'})).value.business_name, '<b>Ficticio</b>');
});
test('permission must be explicitly boolean true', () => {
  for (const value of [false, 'true', 'on', 1, null, undefined]) assert.equal(validate(valid({contact_permission: value})).ok, false);
  const request = valid(); delete request.contact_permission;
  assert.equal(validate(request).ok, false);
});
test('rejects malformed email identities', () => {
  for (const contact_email of ['', 'no-address', 'a@@example.test', '.a@example.test', 'a..b@example.test', 'a.@example.test', 'a@localhost', 'a@-example.test', 'a@example-.test', 'a@exa mple.test', 'a b@example.test']) {
    assert.equal(validate(valid({contact_email})).ok, false, contact_email);
  }
});
test('checks total email length, local-part length and label boundaries', () => {
  const domain = `${'d'.repeat(63)}.${'e'.repeat(63)}.${'f'.repeat(61)}`;
  assert.equal(validate(valid({contact_email: `${'a'.repeat(64)}@${domain}`})).ok, true);
  assert.equal(validate(valid({contact_email: `${'a'.repeat(64)}@${domain}g`})).ok, false);
  assert.equal(validate(valid({contact_email: `${'a'.repeat(65)}@example.test`})).ok, false);
  assert.equal(validate(valid({contact_email: `a@${'d'.repeat(64)}.test`})).ok, false);
});
test('rejects control characters before trimming, including trailing newlines', () => {
  for (const control of ['\n', '\r', '\t', '\0', '\u007f', '\u0085', '\u2028', '\u2029']) {
    assert.equal(validate(valid({contact_email: `pilot@example.test${control}`})).ok, false);
    assert.equal(validate(valid({business_name: `Ficticio${control}`})).ok, false);
  }
});
test('business limit and field types reject excess or nested data', () => {
  assert.equal(validate(valid({business_name: 'A'.repeat(100)})).ok, true);
  assert.equal(validate(valid({business_name: 'A'.repeat(101)})).ok, false);
  for (const field of ['contact_email', 'business_name']) {
    for (const value of [null, 12, {}, [], true]) assert.equal(validate(valid({[field]: value})).ok, false);
  }
});
test('rejects fields outside allowlist, including private data and client metadata', () => {
  for (const key of ['invoices', 'balance', 'received_at', 'notice_version', 'request_id', '__proto__']) {
    const request = valid(); Object.defineProperty(request, key, {value: 'not accepted', enumerable: true});
    assert.deepEqual(validate(request), {ok: false, errors: ['unexpected_fields']});
  }
});
test('rejects invalid payload shapes; accepts parsed objects with null prototype', () => {
  for (const payload of [null, undefined, [], '', 0, new Date(), Object.create(valid())]) assert.deepEqual(validate(payload), {ok: false, errors: ['payload']});
  assert.equal(validate(Object.assign(Object.create(null), valid())).ok, true);
});
test('does not mutate the request or expose rejected values in errors', () => {
  const request = Object.freeze(valid()); assert.equal(validate(request).ok, true);
  assert.deepEqual(validate(valid({contact_email: 'invalid'})), {ok: false, errors: ['contact_email']});
});
