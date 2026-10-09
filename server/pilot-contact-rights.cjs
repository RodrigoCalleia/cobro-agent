'use strict';

const {createPilotContactTokenDeriver} = require('./pilot-contact-token.cjs');
const {createPilotContactIndex} = require('./pilot-contact-index.cjs');
const {createNetlifyContactIndexAdapters} = require('./netlify-contact-index.cjs');
const {createPilotInterestStore} = require('./pilot-interest-store.cjs');

// Disconnected private preparation. It is not an endpoint and deliberately
// does not execute suppression. Any later executor must revalidate records.
function createPilotContactRightsPreparation({keyring, getStore, environment, maxIds = 50} = {}) {
  const tokenDeriver = createPilotContactTokenDeriver(keyring);
  const contactAdapters = createNetlifyContactIndexAdapters({getStore, environment, maxIds});
  const contactIndex = createPilotContactIndex({
    deriveTokens: tokenDeriver.deriveTokens,
    putIfNew: contactAdapters.putIfNew,
    listByPrefix: contactAdapters.listByPrefix,
    maxIds
  });
  const requestStore = createPilotInterestStore({getStore, environment});

  async function indexStoredRequest(contact, requestId) {
    const normalized = contactIndex.normalize(contact);
    const binding = await requestStore.matchContact(requestId, normalized);
    if (!binding || binding.state !== 'matched' || Reflect.ownKeys(binding).length !== 1) {
      throw new Error('Private record binding unverified');
    }
    const indexed = await contactIndex.add(normalized, requestId);
    if (!indexed || Reflect.ownKeys(indexed).length !== 1 ||
        typeof indexed.created !== 'boolean') {
      throw new Error('Private membership result unverified');
    }
    return Object.freeze({state: 'indexed-confirmed'});
  }

  async function planSuppression(contact) {
    const normalized = contactIndex.normalize(contact);
    const found = await contactIndex.find(normalized);
    if (!found || typeof found !== 'object' || Array.isArray(found) ||
        Reflect.ownKeys(found).length !== 1 || !Array.isArray(found.requestIds)) {
      throw new Error('Private contact lookup unverified');
    }
    const requestIds = [];
    const alreadySuppressed = [];
    for (const requestId of found.requestIds) {
      const binding = await requestStore.matchContact(requestId, normalized);
      if (!binding || Reflect.ownKeys(binding).length !== 1) {
        return Object.freeze({state: 'unverified'});
      }
      if (binding.state === 'matched') requestIds.push(requestId);
      else if (binding.state === 'suppressed') alreadySuppressed.push(requestId);
      else return Object.freeze({state: 'unverified'});
    }
    requestIds.sort();
    alreadySuppressed.sort();
    return Object.freeze({
      state: 'ready',
      requestIds: Object.freeze(requestIds),
      alreadySuppressed: Object.freeze(alreadySuppressed)
    });
  }

  return Object.freeze({indexStoredRequest, planSuppression});
}

module.exports = {createPilotContactRightsPreparation};
