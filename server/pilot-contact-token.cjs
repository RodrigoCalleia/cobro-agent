'use strict';

const {createHmac, createSecretKey} = require('node:crypto');

const versionPattern = /^[a-z][a-z0-9-]{0,31}$/u;
const tokenPattern = /^[a-f0-9]{64}$/u;
const domain = 'rondacobro/contact-index/v1';

function importKey(entry) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry) ||
      Reflect.ownKeys(entry).length !== 2 || !versionPattern.test(entry.version) ||
      !Buffer.isBuffer(entry.secret) || entry.secret.length < 32 || entry.secret.length > 128) {
    throw new TypeError('contact-token key is invalid');
  }
  return Object.freeze({
    version: entry.version,
    key: createSecretKey(Buffer.from(entry.secret))
  });
}

// Preparation only. Secrets must be supplied by an approved server-side secret
// store at activation time; callers retain no access to the imported KeyObjects.
function createPilotContactTokenDeriver({active, previous = []} = {}) {
  if (!Array.isArray(previous) || previous.length > 2) {
    throw new TypeError('contact-token keyring is invalid');
  }
  const keyring = [importKey(active), ...previous.map(importKey)];
  if (new Set(keyring.map(entry => entry.version)).size !== keyring.length) {
    throw new TypeError('contact-token versions must be unique');
  }

  function tokenFor(entry, normalizedContact) {
    return createHmac('sha256', entry.key)
      .update(domain, 'utf8')
      .update('\0', 'utf8')
      .update(entry.version, 'utf8')
      .update('\0', 'utf8')
      .update(normalizedContact, 'utf8')
      .digest('hex');
  }

  async function deriveTokens(normalizedContact) {
    if (typeof normalizedContact !== 'string' ||
        normalizedContact !== normalizedContact.normalize('NFKC').trim().toLocaleLowerCase('en-US')) {
      throw new TypeError('contact-token input must be normalized');
    }
    const lookup = keyring.map(entry => tokenFor(entry, normalizedContact));
    if (!lookup.every(token => tokenPattern.test(token)) || new Set(lookup).size !== lookup.length) {
      throw new Error('contact-token derivation failed');
    }
    return Object.freeze({active: lookup[0], lookup: Object.freeze(lookup)});
  }

  return Object.freeze({deriveTokens});
}

module.exports = {createPilotContactTokenDeriver};
