'use strict';

const {withStorageDeadline, StorageDeadlineError} = require('./storage-deadline.cjs');
const {createPilotOperatorRepair} = require('./pilot-operator-repair.cjs');
const {createNetlifyOperatorAudit} = require('./netlify-operator-audit.cjs');
const {createPilotContactRightsPreparation} = require('./pilot-contact-rights.cjs');

// Disconnected composition only. It is intentionally not imported by a route
// or scheduler. One deadline covers SDK loading, authorization, audit CAS,
// repair reads/writes and terminal persistence.
async function openPublishedOperatorRepair(context, keyring, {
  authorize,
  loadSDK = () => import('@netlify/blobs'),
  fetchImpl = globalThis.fetch,
  timeoutMs = 5000,
  maxIds = 50,
  siteId = 'cobro-agent-rodrigo',
  policyVersion = 'operator-repair-v1',
  clock = Date.now
} = {}) {
  if (context?.deploy?.context !== 'production' || context.deploy.published !== true ||
      context?.site?.name !== siteId || typeof context.site.id !== 'string' || !context.site.id ||
      typeof authorize !== 'function' || typeof fetchImpl !== 'function') {
    throw new TypeError('Unsupported operator repair context');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000 ||
      !Number.isInteger(maxIds) || maxIds < 1 || maxIds > 1000 ||
      typeof siteId !== 'string' || typeof policyVersion !== 'string') {
    throw new TypeError('Unsupported operator repair deadline');
  }

  async function execute(command) {
    try {
      return await withStorageDeadline(async (fetch, check) => {
        const sdk = await loadSDK();
        check();
        if (!sdk || typeof sdk.getStore !== 'function') throw new TypeError('Unsupported operator repair SDK');
        const getStore = options => sdk.getStore({...options, fetch});
        const rights = createPilotContactRightsPreparation({keyring, getStore, environment: 'production', maxIds});
        const audit = createNetlifyOperatorAudit({environment: 'production', clock,
          getStore: options => sdk.getStore({...options, fetch})});
        const executor = createPilotOperatorRepair({
          authorize: value => authorize(value, Object.freeze({fetch, check})),
          audit,
          repair: rights.repairMissingMembership,
          environment: 'production', siteId, policyVersion, clock, check
        });
        check();
        return executor.execute(command);
      }, fetchImpl, timeoutMs);
    } catch (error) {
      if (error instanceof StorageDeadlineError) return Object.freeze({state: 'unverified'});
      throw error;
    }
  }
  return Object.freeze({execute});
}

module.exports = {openPublishedOperatorRepair};
