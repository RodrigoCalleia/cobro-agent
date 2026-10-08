'use strict';

// Preparation only. The injected token function must be a keyed, versioned,
// server-side derivation and must not log its input. Each membership gets its
// own immutable key so concurrent additions never update one shared object.
// Adapters must normalize provider responses: putIfNew returns exactly
// {modified: boolean}, while listByPrefix returns only complete string keys.

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const requestIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;

function normalizePilotContact(value) {
  if (typeof value !== 'string') throw new TypeError('contact must be a string');
  const normalized = value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
  if (normalized.length > 254 || !emailPattern.test(normalized)) {
    throw new TypeError('contact is invalid');
  }
  return normalized;
}

function createPilotContactIndex({deriveToken, putIfNew, listByPrefix, maxIds = 50} = {}) {
  if (typeof deriveToken !== 'function' || typeof putIfNew !== 'function' ||
      typeof listByPrefix !== 'function') {
    throw new TypeError('index adapters are required');
  }
  if (!Number.isInteger(maxIds) || maxIds < 1 || maxIds > 1000) {
    throw new TypeError('maxIds is invalid');
  }

  async function prefixFor(contact) {
    const normalized = normalizePilotContact(contact);
    const token = await deriveToken(normalized);
    if (typeof token !== 'string' || !/^[a-f0-9]{32,128}$/u.test(token)) {
      throw new TypeError('derived token is invalid');
    }
    return `${token}/`;
  }

  async function add(contact, requestId) {
    if (typeof requestId !== 'string' || !requestIdPattern.test(requestId)) {
      throw new TypeError('request ID is invalid');
    }
    const prefix = await prefixFor(contact);
    const result = await putIfNew(`${prefix}${requestId}`);
    if (result === null || typeof result !== 'object' || Array.isArray(result) ||
        Reflect.ownKeys(result).length !== 1 || typeof result.modified !== 'boolean') {
      throw new TypeError('membership write result is invalid');
    }
    return {created: result.modified};
  }

  async function find(contact) {
    const prefix = await prefixFor(contact);
    const keys = await listByPrefix(prefix);
    if (!Array.isArray(keys) || keys.length > maxIds) {
      throw new TypeError('listed index value is invalid');
    }
    const requestIds = keys.map(key => {
      if (typeof key !== 'string' || !key.startsWith(prefix)) {
        throw new TypeError('listed index value is invalid');
      }
      const requestId = key.slice(prefix.length);
      if (!requestIdPattern.test(requestId)) {
        throw new TypeError('listed index value is invalid');
      }
      return requestId;
    });
    if (new Set(requestIds).size !== requestIds.length) {
      throw new TypeError('listed index value is invalid');
    }
    return {requestIds};
  }

  return {add, find, normalize: normalizePilotContact};
}

module.exports = {createPilotContactIndex, normalizePilotContact};
