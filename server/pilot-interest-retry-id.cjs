'use strict';
const {createHmac} = require('node:crypto');

const tokenPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const failure = () => ({ok: false, code: 'invalid_idempotency_key'});
const context = Buffer.from('rondacobro:pilot-interest:retry-id:v1\0', 'utf8');
const typedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);
const getByteLength = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'byteLength').get;
const getByteOffset = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'byteOffset').get;
const getBuffer = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'buffer').get;

function uuidFrom(bytes) {
  const value = Uint8Array.from(bytes.subarray(0, 16));
  value[6] = (value[6] & 0x0f) | 0x40;
  value[8] = (value[8] & 0x3f) | 0x80;
  const hex = Buffer.from(value).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Preparation only. Future trusted route code supplies a stable random secret
// from runtime configuration; no secret or activation flag belongs in the repo.
function createPilotInterestRetryId(configuration = {}) {
  let key;
  try {
    const secret = configuration.secret;
    const byteLength = getByteLength.call(secret);
    const byteOffset = getByteOffset.call(secret);
    const buffer = getBuffer.call(secret);
    if (byteLength < 32) {
      throw new TypeError('Unsupported retry identity configuration');
    }
    key = Buffer.from(new Uint8Array(buffer, byteOffset, byteLength));
  } catch {
    throw new TypeError('Unsupported retry identity configuration');
  }

  return request => {
    let token;
    try {
      if (!(request instanceof Request)) return failure();
      token = request.headers.get('idempotency-key');
      if (token === null || !tokenPattern.test(token)) return failure();
    }
    catch { return failure(); }
    try {
      const digest = createHmac('sha256', key).update(context).update(token, 'utf8').digest();
      return {ok: true, request_id: uuidFrom(digest)};
    } catch {
      return failure();
    }
  };
}

module.exports = {createPilotInterestRetryId};
