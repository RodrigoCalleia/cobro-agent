'use strict';

// Preparation only. The injected token function must use a keyed, versioned,
// server-side derivation and must not log its input. Each membership gets its
// own immutable key so concurrent additions never update one shared object.
// Adapters must normalize provider responses: putIfNew returns exactly
// {modified: boolean}, while listByPrefix returns only complete string keys.

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const controlPattern = /[\u0000-\u001f\u007f-\u009f]/u;
const requestIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const tokenPattern = /^[a-f0-9]{64}$/u;

function normalizePilotContact(value) {
  if (typeof value !== 'string') throw new TypeError('contact must be a string');
  const normalized = value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
  if (normalized.length > 254 || controlPattern.test(normalized) || !emailPattern.test(normalized)) {
    throw new TypeError('contact is invalid');
  }
  return normalized;
}

function createPilotContactIndex({deriveTokens, putIfNew, listByPrefix, maxIds = 50} = {}) {
  if (typeof deriveTokens !== 'function' || typeof putIfNew !== 'function' ||
      typeof listByPrefix !== 'function') {
    throw new TypeError('index adapters are required');
  }
  if (!Number.isInteger(maxIds) || maxIds < 1 || maxIds > 1000) {
    throw new TypeError('maxIds is invalid');
  }

  async function prefixesFor(contact) {
    const normalized = normalizePilotContact(contact);
    const derived = await deriveTokens(normalized);
    if (derived === null || typeof derived !== 'object' || Array.isArray(derived) ||
        Reflect.ownKeys(derived).length !== 2 || typeof derived.active !== 'string' ||
        !Array.isArray(derived.lookup) || derived.lookup.length < 1 || derived.lookup.length > 3 ||
        derived.lookup[0] !== derived.active || new Set(derived.lookup).size !== derived.lookup.length ||
        !derived.lookup.every(token => tokenPattern.test(token))) {
      throw new TypeError('derived tokens are invalid');
    }
    return {
      active: `${derived.active}/`,
      lookup: derived.lookup.map(token => `${token}/`)
    };
  }

  async function add(contact, requestId) {
    if (typeof requestId !== 'string' || !requestIdPattern.test(requestId)) {
      throw new TypeError('request ID is invalid');
    }
    const prefixes = await prefixesFor(contact);
    const result = await putIfNew(`${prefixes.active}${requestId}`);
    if (result === null || typeof result !== 'object' || Array.isArray(result) ||
        Reflect.ownKeys(result).length !== 1 || typeof result.modified !== 'boolean') {
      throw new TypeError('membership write result is invalid');
    }
    return {created: result.modified};
  }

  async function find(contact) {
    const prefixes = await prefixesFor(contact);
    const requestIds = [];
    const seen = new Set();
    let processed = 0;
    for (const prefix of prefixes.lookup) {
      const keys = await listByPrefix(prefix);
      if (!Array.isArray(keys)) {
        throw new TypeError('listed index value is invalid');
      }
      const seenInPrefix = new Set();
      for (const key of keys) {
        processed += 1;
        if (processed > maxIds) {
          throw new TypeError('listed index value is invalid');
        }
        if (typeof key !== 'string' || !key.startsWith(prefix)) {
          throw new TypeError('listed index value is invalid');
        }
        const requestId = key.slice(prefix.length);
        if (!requestIdPattern.test(requestId)) {
          throw new TypeError('listed index value is invalid');
        }
        if (seenInPrefix.has(requestId)) {
          throw new TypeError('listed index value is invalid');
        }
        seenInPrefix.add(requestId);
        if (!seen.has(requestId)) {
          seen.add(requestId);
          requestIds.push(requestId);
        }
      }
    }
    return {requestIds};
  }

  return {add, find, normalize: normalizePilotContact};
}

module.exports = {createPilotContactIndex, normalizePilotContact};
