'use strict';

// Unused same-origin browser boundary. Origin is a browser signal, not identity
// or authentication; future route code must still enforce deploy/storage gates.
const requestMethod = Object.getOwnPropertyDescriptor(Request.prototype, 'method').get;
const requestHeaders = Object.getOwnPropertyDescriptor(Request.prototype, 'headers').get;
const headerGet = Headers.prototype.get;
const failure = code => ({ok: false, code});

function createPilotInterestPreflight(configuration = {}) {
  let allowedOrigin;
  try {
    allowedOrigin = configuration.allowedOrigin;
    if (typeof allowedOrigin !== 'string') throw new TypeError();
    const parsed = new URL(allowedOrigin);
    if (parsed.protocol !== 'https:' || parsed.origin !== allowedOrigin ||
        parsed.username || parsed.password || parsed.pathname !== '/' ||
        parsed.search || parsed.hash) throw new TypeError();
  } catch {
    throw new TypeError('Unsupported pilot-interest origin configuration');
  }

  return request => {
    try {
      // Intrinsic access avoids overridden method/headers/get properties.
      // Native brand checking can invoke Proxy prototype traps; errors remain
      // generic. Only a native Request is supported at this trusted boundary.
      if (requestMethod.call(request) !== 'POST') return failure('method_not_allowed');
      const headers = requestHeaders.call(request);
      if (headerGet.call(headers, 'origin') !== allowedOrigin) return failure('origin_not_allowed');
      return {ok: true};
    } catch {
      return failure('invalid_request');
    }
  };
}

module.exports = {createPilotInterestPreflight};
