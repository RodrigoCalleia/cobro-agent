'use strict';

// Preparation only: no fetch, DOM integration, publication, storage or logging.
// transport is a trusted adapter resolving {status, body: parsed JSON object}.
// That future adapter must bound network/body reading before this classification.
const pilotUuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const pilotNoticePattern = /^[a-z0-9][a-z0-9._-]{0,63}$/u;
const pilotRejectedCodes = new Map([
  [400, new Set(['invalid_request', 'invalid_idempotency_key', 'invalid_body',
    'invalid_length', 'invalid_utf8', 'invalid_json', 'duplicate_keys',
    'validation_failed', 'request_aborted'])],
  [403, new Set(['origin_not_allowed'])],
  [405, new Set(['method_not_allowed'])],
  [408, new Set(['read_timeout'])],
  [409, new Set(['notice_mismatch'])],
  [413, new Set(['too_large'])],
  [415, new Set(['unsupported_media_type', 'unsupported_encoding'])]
]);

function pilotExactObject(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
    Reflect.ownKeys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}

function pilotClassifyResponse(result) {
  if (!pilotExactObject(result, ['status', 'body'])) return {state: 'received-unverified', code: 'response_unrecognized'};
  const status = result.status, body = result.body;
  if (pilotExactObject(body, ['state'])) {
    const state = body.state;
    if (status === 200 && state === 'stored-confirmed') return {state, code: null};
    if (status === 202 && state === 'received-unverified') return {state, code: null};
    if (status === 409 && state === 'conflict') return {state: 'rejected', code: 'conflict'};
    if (status === 503 && state === 'unavailable') return {state: 'failed', code: 'unavailable'};
  } else if (pilotExactObject(body, ['state', 'code'])) {
    const state = body.state, code = body.code;
    if (state === 'rejected' && pilotRejectedCodes.get(status)?.has(code)) return {state, code};
  }
  return {state: 'received-unverified', code: 'response_unrecognized'};
}

function createPilotInterestController(configuration = {}) {
  let noticeVersion, transport, generateToken, timeoutMs;
  try {
    noticeVersion = configuration.noticeVersion;
    transport = configuration.transport;
    generateToken = configuration.generateToken ?? (() => globalThis.crypto.randomUUID());
    timeoutMs = configuration.timeoutMs ?? 10000;
    if (typeof noticeVersion !== 'string' || !pilotNoticePattern.test(noticeVersion) ||
        typeof transport !== 'function' || typeof generateToken !== 'function' ||
        !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new TypeError();
  } catch { throw new TypeError('Unsupported pilot-interest controller configuration'); }

  let draft = {contact_email: '', business_name: '', contact_permission: false};
  let body = JSON.stringify(draft), token = null, revision = 0, active = null;
  let state = 'editing', code = null, noticeRequiresDecision = false, disposed = false;
  const clock = () => globalThis.performance.now();
  const canSubmit = () => !disposed && !active && !noticeRequiresDecision &&
    state !== 'stored-confirmed' && draft.contact_permission === true && draft.contact_email.trim() !== '';
  const getState = () => Object.freeze({state, code, noticeRequiresDecision, canSubmit: canSubmit()});
  const stopActive = () => {
    const previous = active;
    if (previous) {
      active = null;
      // Invalidate BEFORE abort listeners can synchronously reenter this API.
      previous.stop();
      previous.abort.abort();
    }
  };
  const assertLive = () => { if (disposed) throw new TypeError('Pilot-interest controller disposed'); };

  function setDraft(input) {
    assertLive();
    const before = revision;
    let copied;
    try {
      if (!pilotExactObject(input, ['contact_email', 'business_name', 'contact_permission'])) throw new TypeError();
      copied = {contact_email: input.contact_email, business_name: input.business_name,
        contact_permission: input.contact_permission};
      if (typeof copied.contact_email !== 'string' || copied.contact_email.length > 254 ||
          typeof copied.business_name !== 'string' || copied.business_name.length > 100 ||
          typeof copied.contact_permission !== 'boolean') throw new TypeError();
    } catch { throw new TypeError('Invalid pilot-interest draft'); }
    // A getter may have changed/reset/disposed the controller while being copied.
    if (disposed || revision !== before) return getState();
    if (noticeRequiresDecision) copied.contact_permission = false;
    const nextBody = JSON.stringify(copied);
    if (nextBody !== body) {
      revision += 1;
      draft = copied; body = nextBody; token = null; state = 'editing'; code = null;
      stopActive();
    }
    return getState();
  }

  async function submit() {
    assertLive();
    if (!canSubmit()) return getState();
    const attemptRevision = revision;
    if (token === null) {
      let candidate;
      try { candidate = generateToken(); }
      catch {
        if (!disposed && revision === attemptRevision && !active) {state = 'failed'; code = 'token_unavailable';}
        return getState();
      }
      // Token factories are synchronous; promises and invalid UUIDs are rejected.
      if (disposed || revision !== attemptRevision || active) return getState();
      if (typeof candidate !== 'string' || !pilotUuidPattern.test(candidate)) {
        // Do not leave a rejected asynchronous factory promise unhandled.
        if (candidate instanceof Promise) void candidate.catch(() => {});
        state = 'failed'; code = 'token_unavailable'; return getState();
      }
      token = candidate;
    }
    const abort = new AbortController();
    let stop, timer;
    const interrupted = new Promise(resolve => { stop = () => resolve({state: 'received-unverified', code: 'request_interrupted'}); });
    const run = {abort, stop};
    const deadline = clock() + timeoutMs;
    active = run; state = 'submitting'; code = null;
    const request = Object.freeze({method: 'POST', headers: Object.freeze({
      'Content-Type': 'application/json', 'Idempotency-Key': token, 'Pilot-Notice-Version': noticeVersion
    }), body, signal: abort.signal});
    const timedOut = new Promise(resolve => {
      timer = setTimeout(() => {
        // Resolve before abort callbacks: they cannot turn expiration into success.
        resolve({state: 'received-unverified', code: 'request_timeout'});
        abort.abort();
      }, timeoutMs);
    });
    const work = (async () => {
      try {
        const result = await transport(request);
        return pilotClassifyResponse(result);
      } catch { return {state: 'received-unverified', code: 'transport_unverified'}; }
    })();
    try {
      const outcome = await Promise.race([work, interrupted, timedOut]);
      if (!disposed && revision === attemptRevision && active === run) {
        // Classification/getters may have aborted, edited or consumed the budget.
        if (abort.signal.aborted || clock() >= deadline) {
          state = 'received-unverified'; code = clock() >= deadline ? 'request_timeout' : 'request_interrupted';
        } else {
          state = outcome.state; code = outcome.code;
          if (code === 'notice_mismatch') {
            noticeRequiresDecision = true;
            draft = {...draft, contact_permission: false}; body = JSON.stringify(draft);
            token = null;
          }
        }
        active = null;
      }
      return getState();
    } finally { clearTimeout(timer); }
  }

  function cancel() {
    assertLive();
    if (active) {
      revision += 1; state = 'received-unverified'; code = 'request_interrupted';
      stopActive();
    }
    return getState();
  }
  function replaceNotice(version) {
    assertLive();
    if (typeof version !== 'string' || !pilotNoticePattern.test(version)) throw new TypeError('Invalid pilot notice version');
    revision += 1; noticeVersion = version; noticeRequiresDecision = false;
    draft = {...draft, contact_permission: false}; body = JSON.stringify(draft);
    token = null; state = 'editing'; code = null; stopActive();
    return getState();
  }
  function reset() {
    assertLive();
    revision += 1; draft = {contact_email: '', business_name: '', contact_permission: false};
    body = JSON.stringify(draft); token = null; state = 'editing'; code = null; stopActive();
    return getState();
  }
  function dispose() {
    if (!disposed) {
      revision += 1; disposed = true;
      draft = {contact_email: '', business_name: '', contact_permission: false};
      body = ''; token = null; state = 'failed'; code = 'controller_disposed'; stopActive();
    }
    return getState();
  }
  return Object.freeze({getState, setDraft, submit, cancel, replaceNotice, reset, dispose});
}

if (typeof module !== 'undefined' && module.exports) module.exports = {createPilotInterestController};
