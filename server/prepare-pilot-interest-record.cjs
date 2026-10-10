'use strict';
const {randomUUID} = require('node:crypto');
const {validatePilotInterest} = require('./validate-pilot-interest.cjs');

const idPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const noticePattern = /^[a-z0-9][a-z0-9._-]{0,63}$/u;
const failure = errors => ({ok: false, code: 'validation_failed', fields: errors});
const invalidMetadata = () => { throw new TypeError('Invalid trusted metadata'); };
function discardThenable(value) {
  try {
    if (value !== null && ['object', 'function'].includes(typeof value) &&
        typeof value.then === 'function') void Promise.resolve(value).catch(() => {});
  } catch {}
}

// Server-only preparation. A future reviewed route must construct this factory
// with the same approved notice version that its deployed page renders.
function createPilotInterestRecordPreparer({
  noticeVersion,
  generateId = randomUUID,
  now = () => new Date()
} = {}) {
  if (typeof noticeVersion !== 'string' || !noticePattern.test(noticeVersion) ||
      typeof generateId !== 'function' || typeof now !== 'function') {
    throw new TypeError('Unsupported trusted metadata configuration');
  }

  return payload => {
    let checked;
    try { checked = validatePilotInterest(payload); }
    catch { throw new TypeError('Invalid pilot interest payload'); }
    if (!checked.ok) return failure(checked.errors);

    let requestId;
    try { requestId = generateId(); }
    catch { invalidMetadata(); }
    if (typeof requestId !== 'string' || !idPattern.test(requestId)) {
      discardThenable(requestId);
      invalidMetadata();
    }

    let instant;
    let receivedAt;
    try {
      instant = now();
      if (!Number.isFinite(Date.prototype.getTime.call(instant))) invalidMetadata();
      receivedAt = Date.prototype.toISOString.call(instant);
    } catch {
      discardThenable(instant);
      invalidMetadata();
    }

    return {
      ok: true,
      value: {
        ...checked.value,
        request_id: requestId,
        received_at: receivedAt,
        notice_version: noticeVersion
      }
    };
  };
}

module.exports = {createPilotInterestRecordPreparer};
