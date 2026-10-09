'use strict';

const {isDeepStrictEqual} = require('node:util');

const storageRegion = 'eu-central-1';
const membershipPattern = /^[a-f0-9]{64}\/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const prefixPattern = /^[a-f0-9]{64}\/$/u;
const root = 'members/';
const marker = Object.freeze({state: 'member'});

// Disconnected server adapter. It normalizes the pinned SDK's richer response
// shapes for pilot-contact-index.cjs but is not imported by the public route.
function createNetlifyContactIndexAdapters({getStore, environment, maxIds = 50} = {}) {
  if (!['production', 'test'].includes(environment) || typeof getStore !== 'function' ||
      !Number.isInteger(maxIds) || maxIds < 1 || maxIds > 1000) {
    throw new TypeError('Unsupported contact-index storage context');
  }
  const store = getStore({
    name: `cobro-pilot-contact-index-${environment}-v1`,
    consistency: 'strong',
    region: storageRegion
  });
  if (!store || typeof store.setJSON !== 'function' || typeof store.get !== 'function' ||
      typeof store.list !== 'function') {
    throw new TypeError('Unsupported contact-index storage adapter');
  }

  return {
    async putIfNew(key) {
      if (typeof key !== 'string' || !membershipPattern.test(key)) {
        throw new TypeError('Invalid contact-index membership');
      }
      const storageKey = `${root}${key}`;
      const result = await store.setJSON(
        storageKey,
        marker,
        {onlyIfNew: true}
      );
      if (!result || typeof result !== 'object' || Array.isArray(result) ||
          typeof result.modified !== 'boolean') {
        throw new Error('Private contact-index write unverified');
      }
      const stored = await store.get(storageKey, {type: 'json', consistency: 'strong'});
      if (!isDeepStrictEqual(stored, marker)) {
        throw new Error('Private contact-index write unverified');
      }
      return {modified: result.modified};
    },

    async listByPrefix(prefix) {
      if (typeof prefix !== 'string' || !prefixPattern.test(prefix)) {
        throw new TypeError('Invalid contact-index prefix');
      }
      const pages = store.list({prefix: `${root}${prefix}`, paginate: true});
      if (!pages || typeof pages[Symbol.asyncIterator] !== 'function') {
        throw new Error('Private contact-index list unverified');
      }
      const keys = [];
      for await (const page of pages) {
        if (!page || typeof page !== 'object' || Array.isArray(page) ||
            !Array.isArray(page.blobs) || !Array.isArray(page.directories)) {
          throw new Error('Private contact-index list unverified');
        }
        for (const blob of page.blobs) {
          if (!blob || typeof blob !== 'object' || Array.isArray(blob) ||
              typeof blob.key !== 'string' || !blob.key.startsWith(root)) {
            throw new Error('Private contact-index list unverified');
          }
          keys.push(blob.key.slice(root.length));
          if (keys.length > maxIds) throw new Error('Private contact-index list limit');
        }
      }
      return keys;
    }
  };
}

module.exports = {createNetlifyContactIndexAdapters};
