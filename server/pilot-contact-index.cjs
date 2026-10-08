'use strict';

// Preparation only. This module never persists raw contact data and does not
// open provider storage. The injected token function must be a keyed,
// versioned server-side derivation (for example, HMAC) and must not log input.

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

function createPilotContactIndex({deriveToken, read, update, maxIds = 50} = {}) {
  if (typeof deriveToken !== 'function' || typeof read !== 'function' || typeof update !== 'function') {
    throw new TypeError('index adapters are required');
  }
  if (!Number.isInteger(maxIds) || maxIds < 1 || maxIds > 1000) {
    throw new TypeError('maxIds is invalid');
  }

  async function tokenFor(contact) {
    const normalized = normalizePilotContact(contact);
    const token = await deriveToken(normalized);
    if (typeof token !== 'string' || !/^[a-f0-9]{32,128}$/u.test(token)) {
      throw new TypeError('derived token is invalid');
    }
    return token;
  }

  async function add(contact, requestId) {
    if (typeof requestId !== 'string' || !requestIdPattern.test(requestId)) {
      throw new TypeError('request ID is invalid');
    }
    const token = await tokenFor(contact);
    const result = await update(token, current => {
      const ids = current === undefined ? [] : current;
      if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !requestIdPattern.test(id))) {
        throw new TypeError('stored index value is invalid');
      }
      if (ids.includes(requestId)) return undefined;
      if (ids.length >= maxIds) throw new Error('contact index limit reached');
      return [...ids, requestId];
    });
    if (!Array.isArray(result) || result.some(id => typeof id !== 'string' || !requestIdPattern.test(id))) {
      throw new TypeError('updated index value is invalid');
    }
    return {token, requestIds: [...result]};
  }

  async function find(contact) {
    const token = await tokenFor(contact);
    const current = await read(token);
    if (current === undefined) return {token, requestIds: []};
    if (!Array.isArray(current) || current.some(id => typeof id !== 'string' || !requestIdPattern.test(id))) {
      throw new TypeError('stored index value is invalid');
    }
    return {token, requestIds: [...current]};
  }

  return {add, find, normalize: normalizePilotContact};
}

module.exports = {createPilotContactIndex, normalizePilotContact};
