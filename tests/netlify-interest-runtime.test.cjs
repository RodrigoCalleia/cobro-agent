const {test} = require('node:test');
const assert = require('node:assert/strict');
const {openPublishedInterestStore} = require('../server/netlify-interest-store.cjs');

const published = {
  deploy: {context: 'production', published: true},
  site: {name: 'cobro-agent-rodrigo', id: 'synthetic-site'}
};
const record = {
  contact_email: 'synthetic@example.invalid',
  business_name: 'Synthetic fixture',
  contact_permission: true,
  request_id: '9fefed22-4070-4b2d-89a0-c494e2c6b238',
  received_at: '2026-10-06T00:00:00.000Z',
  notice_version: 'fixture-only'
};

test('disabled deployed handler never accesses a request, context or network', async t => {
  const {default: handler} = await import('../netlify/functions/pilot-interest.mjs');
  let networkCalls = 0;
  t.mock.method(globalThis, 'fetch', () => {networkCalls++; throw new Error('No network allowed');});
  const forbidden = new Proxy({}, {get() {throw new Error('Request/context must not be accessed');}});
  for (const context of [forbidden, published, {deploy: {context: 'deploy-preview'}}]) {
    const response = await handler(forbidden, context);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assert.deepEqual(await response.json(), {state: 'unavailable'});
  }
  assert.equal(networkCalls, 0);
});

test('disabled handler does not consume even a valid synthetic POST', async () => {
  const {default: handler} = await import('../netlify/functions/pilot-interest.mjs');
  const request = new Request('https://example.invalid/.netlify/functions/pilot-interest', {
    method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(record)
  });
  const response = await handler(request, published);
  assert.equal(request.bodyUsed, false);
  assert.deepEqual(await response.json(), {state: 'unavailable'});
});

test('unknown, preview, unpublished and wrong-site contexts fail before SDK load', async () => {
  let loads = 0;
  const loadSDK = async () => {loads++; throw new Error('SDK must not be loaded');};
  for (const context of [undefined, {}, {environment: 'production'},
    {...published, deploy: {context: 'deploy-preview', published: true}},
    {...published, deploy: {context: 'branch-deploy', published: true}},
    {...published, deploy: {context: 'dev', published: true}},
    {...published, deploy: {context: 'production', published: false}},
    {...published, deploy: {context: 'production', published: 'true'}},
    {...published, site: {...published.site, name: 'another-site'}},
    {...published, site: {...published.site, id: ''}}
  ]) await assert.rejects(openPublishedInterestStore(context, {loadSDK}), /Unsupported storage context/);
  assert.equal(loads, 0);
});

// Exercise the installed SDK against an in-process transport, with synthetic
// credentials/URLs only. No network or private provider record is involved.
async function sdkFixture(t, {initial = null, writeStatus, deleteStatus = 200,
  timeoutMs, transportHook, sdkOptions = {}} = {}) {
  // The SDK uses a 1ms retry delay in test mode, instead of its 5s default.
  const previousEnv = process.env.NODE_ENV;
  let getStore;
  try {
    process.env.NODE_ENV = 'test';
    ({getStore} = await import('@netlify/blobs'));
  } finally {
    if (previousEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnv;
  }
  const requests = [];
  let stored = initial;
  t.mock.method(globalThis, 'fetch', () => {throw new Error('No real network allowed');});
  const baseTransport = async (input, options) => {
    const url = new URL(input);
    assert.equal(url.origin, 'https://strong.example.invalid');
    if (options.method === 'put') {
      assert.equal(options.headers['content-type'], 'application/json');
      if (writeStatus) return new Response(null, {status: writeStatus});
      if (options.headers['if-none-match'] === '*' && stored) return new Response(null, {status: 412});
      stored = JSON.parse(options.body);
      return new Response(null, {status: 200, headers: {etag: 'fixture-etag'}});
    }
    if (options.method === 'get') return stored ?
      Response.json(stored) : new Response(null, {status: 404});
    if (options.method === 'delete') {
      if (deleteStatus === 200) stored = null;
      return new Response(null, {status: deleteStatus});
    }
    throw new Error('Unexpected fixture method');
  };
  const transport = (input, options) => {
    const url = new URL(input);
    requests.push({method: options.method, headers: options.headers,
      path: url.pathname, region: url.searchParams.get('region'), signal: options.signal});
    return transportHook ? transportHook(input, options, baseTransport) : baseTransport(input, options);
  };
  const adapter = await openPublishedInterestStore(published, {
    fetchImpl: transport,
    ...(timeoutMs === undefined ? {} : {timeoutMs}),
    loadSDK: async () => ({getStore: options => getStore({
      ...options, siteID: 'synthetic-site', token: 'synthetic-not-a-credential',
      edgeURL: 'https://cached.example.invalid',
      uncachedEdgeURL: 'https://strong.example.invalid', ...sdkOptions
    })})
  });
  return {adapter, requests};
}

test('deadline configuration is bounded and rejected before SDK load', async () => {
  let loads = 0;
  for (const timeoutMs of [0, -1, 10001, 1.5, Infinity, NaN, '5000', null]) {
    await assert.rejects(openPublishedInterestStore(published, {
      timeoutMs, loadSDK: async () => {loads++; throw new Error('Unexpected SDK load');}
    }), /Unsupported storage deadline/);
  }
  assert.equal(loads, 0);
});

test('a stalled PUT returns unverified and forwards an aborted signal', async t => {
  const {adapter, requests} = await sdkFixture(t, {
    timeoutMs: 20, transportHook: () => new Promise(() => {})
  });
  assert.deepEqual(await adapter.create(record), {state: 'received-unverified'});
  assert.equal(requests.length, 1);
  assert.equal(requests[0].signal.aborted, true);
});

test('a late successful PUT never starts a confirmation read or another SDK fetch', async t => {
  let finish;
  const {adapter, requests} = await sdkFixture(t, {
    timeoutMs: 20, transportHook: () => new Promise(resolve => {finish = resolve;})
  });
  assert.deepEqual(await adapter.create(record), {state: 'received-unverified'});
  finish(new Response(null, {status: 200}));
  // The actual SDK retries rejected transport calls; closed budgets stop them
  // before reaching transport. Allow its five in-process test-delay retries.
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.deepEqual(requests.map(r => r.method), ['put']);
});

test('PUT and strong-read JSON consumption share one deadline', async t => {
  let finishBody;
  const {adapter, requests} = await sdkFixture(t, {
    timeoutMs: 20, transportHook: async (input, options, next) => {
      const response = await next(input, options);
      if (options.method === 'get') {
        response.json = () => new Promise(resolve => {finishBody = resolve;});
      }
      return response;
    }
  });
  assert.deepEqual(await adapter.create(record), {state: 'received-unverified'});
  assert.deepEqual(requests.map(r => r.method), ['put', 'get']);
  assert.equal(requests[0].signal, requests[1].signal);
  assert.equal(requests[1].signal.aborted, true);
  finishBody(record);
  await new Promise(resolve => setImmediate(resolve));
});

test('a stalled private read throws rather than claiming the record is absent', async t => {
  const {adapter, requests} = await sdkFixture(t, {
    timeoutMs: 20, transportHook: () => new Promise(() => {})
  });
  await assert.rejects(adapter.read(record.request_id), /^Error: Private read unverified$/);
  assert.equal(requests[0].signal.aborted, true);
});

test('production physical deletion is unavailable without contacting storage', async t => {
  const {adapter, requests} = await sdkFixture(t, {initial: record});
  assert.deepEqual(await adapter.delete(record.request_id), {state: 'delete-unavailable'});
  assert.equal(requests.length, 0);
});

test('expiration of one call leaves concurrent and later calls usable', async t => {
  let finish;
  const {adapter, requests} = await sdkFixture(t, {
    timeoutMs: 30, transportHook: (input, options, next) => {
      if (options.method === 'put') return new Promise(resolve => {finish = resolve;});
      return next(input, options);
    }
  });
  const slow = adapter.create(record);
  assert.equal(await adapter.read(record.request_id), null);
  assert.deepEqual(await slow, {state: 'received-unverified'});
  assert.equal(await adapter.read(record.request_id), null);
  assert.notEqual(requests[0].signal, requests[1].signal);
  finish(new Response(null, {status: 200}));
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.deepEqual(requests.map(r => r.method), ['put', 'get', 'get']);
});

test('monotonic deadline prevents confirmation even when the timer cannot run', async t => {
  const {performance} = require('node:perf_hooks');
  const {adapter, requests} = await sdkFixture(t, {
    timeoutMs: 10, transportHook: () => {
      const until = performance.now() + 20;
      while (performance.now() < until) {} // Deliberately block timer dispatch.
      return new Response(null, {status: 200});
    }
  });
  assert.deepEqual(await adapter.create(record), {state: 'received-unverified'});
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.deepEqual(requests.map(r => r.method), ['put']);
});

test('invalid private values remain validation errors and never reach transport', async t => {
  const {adapter, requests} = await sdkFixture(t);
  await assert.rejects(adapter.create({...record, extra: 'forbidden'}), TypeError);
  await assert.rejects(adapter.read('email-as-key@example.invalid'), TypeError);
  await assert.rejects(adapter.delete('invalid'), TypeError);
  assert.equal(requests.length, 0);
});

test('late JSON from a timer-blocking read cannot produce a confirmation', async t => {
  const {performance} = require('node:perf_hooks');
  const {adapter, requests} = await sdkFixture(t, {
    timeoutMs: 10, transportHook: async (input, options, next) => {
      const response = await next(input, options);
      if (options.method === 'get') response.json = async () => {
        const until = performance.now() + 20;
        while (performance.now() < until) {}
        return record;
      };
      return response;
    }
  });
  assert.deepEqual(await adapter.create(record), {state: 'received-unverified'});
  assert.deepEqual(requests.map(r => r.method), ['put', 'get']);
});

test('SDK cloned error-body reads stay inside the private-read deadline', async t => {
  let finishBody;
  let clones = 0;
  const {adapter, requests} = await sdkFixture(t, {
    timeoutMs: 20,
    sdkOptions: {edgeURL: undefined, apiURL: 'https://api.example.invalid'},
    transportHook: () => {
      const response = new Response(null, {status: 403});
      response.clone = () => {
        clones++;
        const copy = new Response(null, {status: 403});
        copy.text = () => new Promise(resolve => {finishBody = resolve;});
        return copy;
      };
      return response;
    }
  });
  await assert.rejects(adapter.read(record.request_id), /^Error: Private read unverified$/);
  assert.equal(clones, 1);
  assert.equal(requests[0].signal.aborted, true);
  finishBody('Synthetic provider error');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 1);
});

test('installed pinned SDK supports create-only, strong read and retry', async t => {
  assert.equal(require('@netlify/blobs/package.json').version, '11.1.1');
  const {adapter, requests} = await sdkFixture(t);
  assert.deepEqual(await adapter.create(record), {
    state: 'stored-confirmed', request_id: record.request_id, created: true
  });
  assert.deepEqual(await adapter.create(record), {
    state: 'stored-confirmed', request_id: record.request_id, created: false
  });
  assert.deepEqual(await adapter.read(record.request_id), record);
  assert.ok(requests.every(r => r.path.includes('/site:cobro-pilot-interest-production-v1/requests/')));
  assert.deepEqual(requests.map(r => r.method), ['put','get','put','get','get']);
});

test('installed pinned SDK routes the fixed EU blob region to its API', async () => {
  const {getStore} = await import('@netlify/blobs');
  const requests = [];
  const store = getStore({
    name: 'region-probe', region: 'eu-central-1', siteID: 'synthetic-site',
    token: 'synthetic-not-a-credential',
    fetch: async (input, options) => {
      requests.push({url: new URL(input), method: options.method});
      return new Response(null, {status: 404});
    }
  });
  await assert.rejects(store.get('probe', {consistency: 'strong'}));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'get');
  assert.equal(requests[0].url.origin, 'https://api.netlify.com');
  assert.equal(requests[0].url.searchParams.get('region'), 'eu-central-1');
});

test('installed pinned SDK overwrites contact data with a suppression marker and blocks replay', async t => {
  const {adapter, requests} = await sdkFixture(t);
  assert.equal((await adapter.create(record)).state, 'stored-confirmed');
  assert.deepEqual(await adapter.suppress(record.request_id), {state: 'suppressed-confirmed'});
  assert.deepEqual(await adapter.read(record.request_id), {state: 'suppressed'});
  assert.deepEqual(await adapter.create(record), {state: 'suppressed'});
  assert.deepEqual(await adapter.read(record.request_id), {state: 'suppressed'});
  assert.equal(JSON.stringify(requests).includes('synthetic@example.invalid'), false);
  assert.deepEqual(requests.map(r => r.method), ['put', 'get', 'put', 'get', 'get', 'put', 'get', 'get']);
  assert.equal(requests[2].headers['if-none-match'], undefined);
  assert.equal(requests[5].headers['if-none-match'], '*');
});

test('actual SDK retry with conflicting record never overwrites', async t => {
  const {adapter} = await sdkFixture(t, {initial: {...record, business_name: 'Earlier fixture'}});
  assert.deepEqual(await adapter.create(record), {state: 'conflict'});
  assert.equal((await adapter.read(record.request_id)).business_name, 'Earlier fixture');
});

for (const status of [201, 400, 403, 404, 429, 500, 503]) {
  test('unexpected conditional PUT '+status+' cannot claim success from an existing matching record', async t => {
    const {adapter, requests} = await sdkFixture(t, {initial: record, writeStatus: status});
    assert.deepEqual(await adapter.create(record), {state: 'received-unverified'});
    assert.equal(requests.length, 6); // The actual SDK retries a thrown transport error five times.
    assert.ok(requests.every(r => r.method === 'put'));
  });
}

