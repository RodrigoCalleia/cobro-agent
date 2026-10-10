'use strict';
const {performance} = require('node:perf_hooks');
const {createPilotInterestPreflight} = require('./pilot-interest-preflight.cjs');
const {createPilotInterestRetryId} = require('./pilot-interest-retry-id.cjs');
const {readPilotInterest} = require('./read-pilot-interest.cjs');
const {createPilotInterestRecordPreparer} = require('./prepare-pilot-interest-record.cjs');

const requestHeaders = Object.getOwnPropertyDescriptor(Request.prototype, 'headers').get;
const requestSignal = Object.getOwnPropertyDescriptor(Request.prototype, 'signal').get;
const headerGet = Headers.prototype.get;
const STORAGE_BUDGET_MS = 5000;
function response(status, state, code, extraHeaders = {}) {
  return Response.json({state, ...(code ? {code} : {})}, {status, headers: {
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders
  }});
}
const unavailable = () => response(503, 'unavailable');
const unverified = () => response(202, 'received-unverified');
function exactResult(result, keys) {
  return result !== null && typeof result === 'object' && !Array.isArray(result) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(result)) &&
    Reflect.ownKeys(result).length === keys.length && keys.every(key => Object.hasOwn(result, key));
}

// Unused server-only composition, never imported by the public 503 handler.
// openStore MUST be a trusted runtime closure enforcing published Context gates.
// Origin, notice header and retry token are not authentication or proof of consent.
function createPilotInterestProcessor(configuration = {}) {
  let preflight, retryId, noticeVersion, openStore, now;
  try {
    const allowedOrigin = configuration.allowedOrigin;
    noticeVersion = configuration.noticeVersion;
    const secret = configuration.secret;
    openStore = configuration.openStore;
    now = configuration.now ?? (() => new Date());
    if (typeof openStore !== 'function' || typeof now !== 'function') throw new TypeError();
    preflight = createPilotInterestPreflight({allowedOrigin});
    retryId = createPilotInterestRetryId({secret});
    // Validate copied metadata configuration without calling now or opening storage.
    createPilotInterestRecordPreparer({noticeVersion, now});
  } catch {
    throw new TypeError('Unsupported pilot-interest processor configuration');
  }

  return async request => {
    const boundary = preflight(request);
    if (!boundary.ok) {
      const status = boundary.code === 'method_not_allowed' ? 405 :
        boundary.code === 'origin_not_allowed' ? 403 : 400;
      return response(status, 'rejected', boundary.code,
        status === 405 ? {Allow: 'POST'} : {});
    }
    if (headerGet.call(requestHeaders.call(request), 'pilot-notice-version') !== noticeVersion) {
      return response(409, 'rejected', 'notice_mismatch');
    }
    const identity = retryId(request);
    if (!identity.ok) return response(400, 'rejected', 'invalid_idempotency_key');
    let payload;
    try { payload = await readPilotInterest(request); }
    catch { return response(400, 'rejected', 'invalid_body'); }
    if (!payload.ok) {
      const status = payload.code === 'too_large' ? 413 :
        ['unsupported_media_type', 'unsupported_encoding'].includes(payload.code) ? 415 :
          payload.code === 'read_timeout' ? 408 : 400;
      return response(status, 'rejected', payload.code);
    }
    const signal = requestSignal.call(request);
    const aborted = () => response(400, 'rejected', 'request_aborted');
    if (signal.aborted) return aborted();
    let record;
    try {
      record = createPilotInterestRecordPreparer({
        noticeVersion, generateId: () => identity.request_id, now
      })(payload.value);
      if (!record.ok) return unavailable();
    } catch { return unavailable(); }
    if (signal.aborted) return aborted();

    // Bounds awaiting lazy initialization and creation, including collaborators
    // that never settle. An expired initialization may not start a late write.
    // A write already started can still commit: expiration is never success.
    const deadline = performance.now() + STORAGE_BUDGET_MS;
    let closed = false, writeStarted = false, timer;
    const work = async () => {
      let store, create;
      try {
        store = await openStore();
        if (closed || performance.now() >= deadline) return unavailable();
        if (signal.aborted) return aborted();
        create = store?.create;
        if (typeof create !== 'function') return unavailable();
      } catch { return unavailable(); }
      if (closed || performance.now() >= deadline) return unavailable();
      if (signal.aborted) return aborted();
      writeStarted = true;
      try {
        const result = await create.call(store, record.value);
        if (closed || performance.now() >= deadline || signal.aborted) return unverified();
        // Schema inspection/property access may itself throw, expire the budget
        // or abort the request. Snapshot each collaborator value once, then
        // check again before returning either definitive classification.
        let classified = 202;
        if (exactResult(result, ['state', 'request_id', 'created'])) {
          const state = result.state, requestId = result.request_id, created = result.created;
          if (state === 'stored-confirmed' && requestId === identity.request_id &&
              typeof created === 'boolean') classified = 200;
        } else if (exactResult(result, ['state'])) {
          const state = result.state;
          if (state === 'conflict') classified = 409;
        }
        if (closed || performance.now() >= deadline || signal.aborted) return unverified();
        if (classified === 200) {
          return response(200, 'stored-confirmed');
        }
        if (classified === 409) {
          return response(409, 'conflict');
        }
      } catch {}
      return unverified();
    };
    try {
      return await Promise.race([work(), new Promise(resolve => {
        timer = setTimeout(() => resolve(writeStarted ? unverified() : unavailable()), STORAGE_BUDGET_MS);
      })]);
    } finally {
      closed = true;
      clearTimeout(timer);
    }
  };
}

module.exports = {createPilotInterestProcessor};
