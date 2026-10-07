'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {performance} = require('node:perf_hooks');
const {readPilotInterest: read, MAX_BODY_BYTES} = require('../server/read-pilot-interest.cjs');
const valid = {contact_email: 'synthetic@example.invalid', contact_permission: true};
const json = JSON.stringify(valid);
const encode = value => new TextEncoder().encode(value);
const request = (body = json, headers = {}, extra = {}) => new Request('https://example.invalid/interest', {
  method: 'POST', headers: {'content-type': 'application/json', ...headers}, body,
  ...(body instanceof ReadableStream ? {duplex: 'half'} : {}), ...extra
});
function streamOf(chunks, {onCancel = () => {}} = {}) {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index === chunks.length) controller.close();
      else controller.enqueue(chunks[index++]);
    },
    cancel: onCancel
  }, {highWaterMark: 0});
}

test('normalizes native Request JSON without accessing network or claiming storage', async t => {
  t.mock.method(globalThis, 'fetch', () => {throw new Error('No network allowed');});
  const input = request(JSON.stringify({...valid, business_name: ' Ficticio '}));
  assert.deepEqual(await read(input), {ok: true, value: {...valid, business_name: 'Ficticio'}});
  assert.equal(input.bodyUsed, true);
  assert.equal(input.body.locked, false);
});

test('accepts only JSON with optional UTF-8 charset, including case and quoted spelling', async () => {
  for (const type of ['application/json', 'Application/JSON; charset=UTF-8', 'application/json ; charset="utf-8"']) {
    assert.equal((await read(request(json, {'content-type': type}))).ok, true);
  }
});

test('unsupported methods do not read a body', async () => {
  for (const method of ['PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    const input = request(json, {}, {method});
    assert.deepEqual(await read(input), {ok: false, code: 'method_not_allowed'});
    assert.equal(input.bodyUsed, false);
  }
  assert.equal((await read(new Request('https://example.invalid'))).code, 'method_not_allowed');
});

test('unsupported/missing media types are rejected before consuming input', async () => {
  for (const type of ['', 'text/plain', 'application/problem+json', 'application/json; charset=latin1',
    'application/json; charset=utf8', 'application/json; charset=utf-8; charset=latin1', 'application/json; extra=true']) {
    const input = request(json, {'content-type': type});
    assert.deepEqual(await read(input), {ok: false, code: 'unsupported_media_type'});
    assert.equal(input.bodyUsed, false);
  }
  const missing = request(streamOf([encode(json)]));
  missing.headers.delete('content-type');
  assert.equal((await read(missing)).code, 'unsupported_media_type');
  assert.equal(missing.bodyUsed, false);
});

test('rejects compressed encodings before reading and accepts explicit identity', async () => {
  for (const encoding of ['gzip', 'br', 'deflate', 'identity,gzip', '']) {
    const input = request(json, {'content-encoding': encoding});
    assert.deepEqual(await read(input), {ok: false, code: 'unsupported_encoding'});
    assert.equal(input.bodyUsed, false);
  }
  assert.equal((await read(request(json, {'content-encoding': 'IDENTITY'}))).ok, true);
});

test('oversized declared length fails before reading', async () => {
  for (const length of ['4097', '9999999999999999999999999999999']) {
    const input = request(json, {'content-length': length});
    assert.deepEqual(await read(input), {ok: false, code: 'too_large'});
    assert.equal(input.bodyUsed, false);
  }
});

test('malformed declared lengths fail before reading', async () => {
  for (const length of ['', '-1', '+12', '1.5', '1e3', '12,12', 'NaN']) {
    const input = request(json, {'content-length': length});
    assert.deepEqual(await read(input), {ok: false, code: 'invalid_length'});
    assert.equal(input.bodyUsed, false);
  }
});

test('declared length must match actual bytes if supplied', async () => {
  const bytes = encode(json).byteLength;
  for (const length of [0, bytes - 1, bytes + 1]) {
    assert.equal((await read(request(json, {'content-length': String(length)}))).code, 'invalid_length');
  }
  assert.equal((await read(request(json, {'content-length': '00'+bytes}))).ok, true);
});

test('accepts exactly 4096 streamed bytes, independent of chunk boundaries', async () => {
  assert.equal(MAX_BODY_BYTES, 4096);
  const exact = encode(json+' '.repeat(MAX_BODY_BYTES-encode(json).byteLength));
  const input = request(streamOf([exact.slice(0, 17), exact.slice(17, 2000), exact.slice(2000)]));
  assert.deepEqual(await read(input), {ok: true, value: valid});
  assert.equal(input.body.locked, false);
});

test('actual byte cap rejects 4097 bytes with absent or understated length and cancels', async () => {
  const excess = encode(json+' '.repeat(MAX_BODY_BYTES+1-encode(json).byteLength));
  for (const headers of [{}, {'content-length': '1'}]) {
    let cancelled = 0;
    const input = request(streamOf([excess.slice(0, 2000), excess.slice(2000)], {
      onCancel: () => {cancelled++;}
    }), headers);
    assert.deepEqual(await read(input), {ok: false, code: 'too_large'});
    assert.equal(cancelled, 1);
    assert.equal(input.body.locked, false);
  }
});

test('counts multibyte UTF-8 bytes rather than JavaScript characters', async () => {
  const unicode = JSON.stringify({...valid, business_name: 'Á'.repeat(100)});
  const exact = unicode+' '.repeat(MAX_BODY_BYTES-encode(unicode).byteLength);
  assert.ok(exact.length < MAX_BODY_BYTES);
  assert.equal((await read(request(exact))).ok, true);
  assert.equal((await read(request(exact+' '))).code, 'too_large');
});

test('split UTF-8 characters are decoded across chunks without replacement', async () => {
  const bytes = encode(JSON.stringify({...valid, business_name: 'Ficticio Á ☕'}));
  const chunks = Array.from(bytes, byte => Uint8Array.of(byte));
  assert.deepEqual(await read(request(streamOf(chunks))), {
    ok: true, value: {...valid, business_name: 'Ficticio Á ☕'}
  });
});

test('invalid or truncated UTF-8 fails closed', async () => {
  for (const bytes of [Uint8Array.of(0xff), Uint8Array.of(0xc0, 0xaf),
    Uint8Array.of(0xe2, 0x82), Uint8Array.of(0xed, 0xa0, 0x80)]) {
    assert.deepEqual(await read(request(streamOf([bytes]))), {ok: false, code: 'invalid_utf8'});
  }
});

test('invalid/empty JSON, trailing values and BOM produce only a generic code', async () => {
  for (const body of ['', '{', json+' {}', '\ufeff'+json, '{"contact_email":"sensitive-error-fixture"']) {
    assert.deepEqual(await read(request(body)), {ok: false, code: 'invalid_json'});
  }
});

test('parsed JSON still passes strict shape, fields and permission validation', async () => {
  for (const payload of [null, [], 'string', 1, {...valid, contact_permission: 'true'},
    {...valid, contact_email: {}}, {...valid, business_name: 'A'.repeat(101)},
    {...valid, received_at: 'client-supplied'}, {...valid, invoices: []},
    JSON.parse('{"contact_email":"synthetic@example.invalid","contact_permission":true,"__proto__":{}}')]) {
    const result = await read(request(JSON.stringify(payload)));
    assert.equal(result.code, 'validation_failed');
    assert.ok(result.fields.every(field => ['payload','unexpected_fields','contact_permission','contact_email','business_name'].includes(field)));
  }
});

test('consumed/locked/missing bodies and non-Request input fail generically', async () => {
  const consumed = request(); await consumed.text();
  assert.deepEqual(await read(consumed), {ok: false, code: 'invalid_body'});
  const locked = request(); const reader = locked.body.getReader();
  assert.equal((await read(locked)).code, 'invalid_body'); reader.releaseLock();
  assert.equal((await read(request(null))).code, 'invalid_body');
  assert.equal((await read({})).code, 'invalid_body');
});

test('a stalled stream times out without waiting for stalled cancellation', async () => {
  let cancelled = 0;
  const input = request(new ReadableStream({
    pull: () => new Promise(() => {}),
    cancel: () => {cancelled++; return new Promise(() => {});}
  }, {highWaterMark: 0}));
  assert.deepEqual(await read(input, {timeoutMs: 20}), {ok: false, code: 'read_timeout'});
  assert.equal(cancelled, 1);
  assert.equal(input.body.locked, false);
});

test('an already-aborted request is not consumed', async () => {
  const controller = new AbortController(); controller.abort();
  const input = request(json, {}, {signal: controller.signal});
  assert.deepEqual(await read(input), {ok: false, code: 'request_aborted'});
  assert.equal(input.bodyUsed, false);
});

test('abort during a stalled read cancels and releases its lock', async () => {
  const controller = new AbortController(); let cancelled = 0;
  const input = request(new ReadableStream({
    pull: () => new Promise(() => {}), cancel: () => {cancelled++;}
  }, {highWaterMark: 0}), {}, {signal: controller.signal});
  const result = read(input);
  controller.abort();
  assert.deepEqual(await result, {ok: false, code: 'request_aborted'});
  assert.equal(cancelled, 1);
  assert.equal(input.body.locked, false);
});

test('read failures and rejected cancellations never expose provider details', async () => {
  const broken = request(new ReadableStream({pull() {throw new Error('private-error-fixture');}}));
  assert.deepEqual(await read(broken), {ok: false, code: 'invalid_body'});
  assert.equal(broken.body.locked, false);
  const excess = request(streamOf([new Uint8Array(MAX_BODY_BYTES+1)], {
    onCancel: () => Promise.reject(new Error('private-cancel-fixture'))
  }));
  assert.deepEqual(await read(excess), {ok: false, code: 'too_large'});
  await new Promise(resolve => setImmediate(resolve));
});

test('non-byte stream chunks fail generically and release the lock', async () => {
  const input = request(streamOf([json]));
  assert.deepEqual(await read(input), {ok: false, code: 'invalid_body'});
  assert.equal(input.body.locked, false);
});

test('monotonic checks reject a late valid body while timer dispatch is blocked', async () => {
  const input = request(new ReadableStream({
    pull(controller) {
      const until = performance.now()+20;
      while (performance.now() < until) {}
      controller.enqueue(encode(json)); controller.close();
    }
  }, {highWaterMark: 0}));
  assert.deepEqual(await read(input, {timeoutMs: 10}), {ok: false, code: 'read_timeout'});
  assert.equal(input.body.locked, false);
});

test('deadline configuration rejects invalid values before consuming input', async () => {
  for (const timeoutMs of [0, -1, 5001, 1.5, NaN, Infinity, '2000', null]) {
    const input = request();
    await assert.rejects(read(input, {timeoutMs}), /Unsupported request deadline/);
    assert.equal(input.bodyUsed, false);
  }
});

test('a slow read does not abort a concurrent or later request', async () => {
  const stalled = request(new ReadableStream({pull: () => new Promise(() => {})}, {highWaterMark: 0}));
  const slow = read(stalled, {timeoutMs: 20});
  assert.deepEqual(await read(request()), {ok: true, value: valid});
  assert.equal((await slow).code, 'read_timeout');
  assert.deepEqual(await read(request()), {ok: true, value: valid});
});
