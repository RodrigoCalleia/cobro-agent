'use strict';
const {performance} = require('node:perf_hooks');
const {validatePilotInterest} = require('./validate-pilot-interest.cjs');

const MAX_BODY_BYTES = 4096;
const failure = code => ({ok: false, code});
class BodyReadError extends Error {
  constructor(code) { super('Invalid pilot-interest request'); this.code = code; }
}

// Unused server preparation, not a route or proof of notice/permission binding.
// No SDK, storage, log, notification or background job is opened here.
async function readPilotInterest(request, {timeoutMs = 2000} = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) {
    throw new TypeError('Unsupported request deadline');
  }
  if (!(request instanceof Request)) return failure('invalid_body');
  if (request.method !== 'POST') return failure('method_not_allowed');
  const type = request.headers.get('content-type')?.trim() ?? '';
  if (!/^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?$/iu.test(type)) {
    return failure('unsupported_media_type');
  }
  const encoding = request.headers.get('content-encoding');
  if (encoding !== null && encoding.trim().toLowerCase() !== 'identity') {
    return failure('unsupported_encoding');
  }
  const declared = request.headers.get('content-length');
  if (declared !== null && !/^\d+$/u.test(declared)) return failure('invalid_length');
  // A length hint can reject early but never replaces counting actual bytes.
  if (declared !== null && Number(declared) > MAX_BODY_BYTES) return failure('too_large');
  if (request.signal.aborted) return failure('request_aborted');
  if (!request.body || request.bodyUsed || request.body.locked) return failure('invalid_body');

  const reader = request.body.getReader();
  const deadline = performance.now() + timeoutMs;
  let stopCode;
  let readDone = false;
  let timer;
  const check = () => {
    if (request.signal.aborted) stopCode ??= 'request_aborted';
    if (performance.now() >= deadline) stopCode ??= 'read_timeout';
    if (stopCode) throw new BodyReadError(stopCode);
  };
  let onAbort;
  const interrupted = new Promise((_, reject) => {
    const stop = code => {
      stopCode ??= code;
      reject(new BodyReadError(stopCode));
    };
    onAbort = () => stop('request_aborted');
    request.signal.addEventListener('abort', onAbort, {once: true});
    timer = setTimeout(() => stop('read_timeout'), timeoutMs);
  });
  const consume = async () => {
    const decoder = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true});
    let bytes = 0;
    let text = '';
    while (true) {
      check();
      const {done, value} = await reader.read();
      check();
      if (done) { readDone = true; break; }
      if (!(value instanceof Uint8Array)) throw new BodyReadError('invalid_body');
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) throw new BodyReadError('too_large');
      try { text += decoder.decode(value, {stream: true}); }
      catch { throw new BodyReadError('invalid_utf8'); }
    }
    if (declared !== null && Number(declared) !== bytes) throw new BodyReadError('invalid_length');
    try { text += decoder.decode(); }
    catch { throw new BodyReadError('invalid_utf8'); }
    let parsed;
    try { parsed = JSON.parse(text); }
    catch { throw new BodyReadError('invalid_json'); }
    check();
    const checked = validatePilotInterest(parsed);
    check();
    return checked.ok ? checked : {ok: false, code: 'validation_failed', fields: checked.errors};
  };
  try {
    return await Promise.race([consume(), interrupted]);
  } catch (error) {
    return failure(stopCode ?? (error instanceof BodyReadError ? error.code : 'invalid_body'));
  } finally {
    stopCode ??= 'invalid_body'; // Stops an outstanding consumer after the race.
    clearTimeout(timer);
    request.signal.removeEventListener('abort', onAbort);
    if (!readDone) {
      // Cancellation may itself stall or reject: never await it or leak errors.
      try { void reader.cancel().catch(() => {}); } catch {}
    }
    try { reader.releaseLock(); } catch {}
  }
}

module.exports = {readPilotInterest, MAX_BODY_BYTES};
