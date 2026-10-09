'use strict';

const {createPilotContactRightsPreparation} = require('./pilot-contact-rights.cjs');
const {withStorageDeadline, StorageDeadlineError} = require('./storage-deadline.cjs');

// Disconnected runtime for private operator preparation. It is not imported by
// the public function. One deadline is shared by the complete reconciliation
// scan, including every request/index page, strong record read and response body.
async function openPublishedContactRights(context, keyring, {
  loadSDK = () => import('@netlify/blobs'),
  fetchImpl = globalThis.fetch,
  timeoutMs = 5000,
  maxIds = 50
} = {}) {
  if (context?.deploy?.context !== 'production' || context.deploy.published !== true ||
      context?.site?.name !== 'cobro-agent-rodrigo' ||
      typeof context.site.id !== 'string' || !context.site.id ||
      typeof fetchImpl !== 'function') {
    throw new TypeError('Unsupported rights storage context');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000 ||
      !Number.isInteger(maxIds) || maxIds < 1 || maxIds > 1000) {
    throw new TypeError('Unsupported rights storage deadline');
  }
  async function planReconciliation() {
    try {
      return await withStorageDeadline(async (fetch, check) => {
        const sdk = await loadSDK();
        check();
        if (!sdk || typeof sdk.getStore !== 'function') {
          throw new TypeError('Unsupported rights storage SDK');
        }
        // A new SDK composition per invocation gives each concurrent plan its
        // own controller while every operation inside one plan shares a budget.
        const rights = createPilotContactRightsPreparation({
          keyring,
          environment: 'production',
          maxIds,
          getStore: options => sdk.getStore({...options, fetch})
        });
        return rights.planReconciliation();
      }, fetchImpl, timeoutMs);
    } catch (error) {
      if (error instanceof StorageDeadlineError) {
        return Object.freeze({state: 'unverified'});
      }
      throw error;
    }
  }

  return Object.freeze({planReconciliation});
}

module.exports = {openPublishedContactRights};
