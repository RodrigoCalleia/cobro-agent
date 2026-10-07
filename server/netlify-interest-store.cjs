'use strict';
const {createPilotInterestStore} = require('./pilot-interest-store.cjs');

function disabledPilotInterest() {
  return Response.json({state: 'unavailable'}, {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

// SDK 11.1.1 treats any conditional PUT status other than 412 as modified.
// Fail closed on unexpected write responses before the SDK can report success.
function verifiedWriteFetch(fetchImpl) {
  return async (input, options) => {
    const response = await fetchImpl(input, options);
    if (options?.method?.toUpperCase() === 'PUT' &&
        ![200, 412].includes(response.status)) throw new Error('Private write unverified');
    return response;
  };
}

// Accept only Context supplied by Netlify to trusted server code, never a body,
// header, query parameter or user-selected environment. This is not a route.
async function openPublishedInterestStore(context, {
  loadSDK = () => import('@netlify/blobs'),
  fetchImpl = globalThis.fetch
} = {}) {
  if (context?.deploy?.context !== 'production' || context.deploy.published !== true ||
      context?.site?.name !== 'cobro-agent-rodrigo' ||
      typeof context.site.id !== 'string' || !context.site.id ||
      typeof fetchImpl !== 'function') throw new TypeError('Unsupported storage context');
  const {getStore} = await loadSDK();
  return createPilotInterestStore({
    environment: 'production',
    getStore: options => getStore({...options, fetch: verifiedWriteFetch(fetchImpl)})
  });
}

module.exports = {openPublishedInterestStore, disabledPilotInterest};
