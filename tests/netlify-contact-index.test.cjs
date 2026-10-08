'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createNetlifyContactIndexAdapters} = require('../server/netlify-contact-index.cjs');

const token = 'a'.repeat(64);
const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';

test('normalizes SDK write and paginated list shapes', async () => {
  const calls = [];
  const adapter = createNetlifyContactIndexAdapters({
    environment: 'production',
    getStore: options => {
      assert.deepEqual(options, {
        name: 'cobro-pilot-contact-index-production-v1',
        consistency: 'strong',
        region: 'eu-central-1'
      });
      return {
        setJSON: async (...args) => {
          calls.push(['setJSON', ...args]);
          return {modified: true, etag: 'provider-etag'};
        },
        list: options => ({
          async *[Symbol.asyncIterator]() {
            calls.push(['list', options]);
            yield {
              blobs: [
                {key: `members/${token}/${id1}`, etag: 'one'},
                {key: `members/${token}/${id2}`, etag: 'two'}
              ],
              directories: []
            };
          }
        })
      };
    }
  });
  assert.deepEqual(await adapter.putIfNew(`${token}/${id1}`), {modified: true});
  assert.deepEqual(await adapter.listByPrefix(`${token}/`), [`${token}/${id1}`, `${token}/${id2}`]);
  assert.deepEqual(calls[0], [
    'setJSON', `members/${token}/${id1}`, {state: 'member'}, {onlyIfNew: true}
  ]);
  assert.deepEqual(calls[1], [
    'list', {prefix: `members/${token}/`, paginate: true}
  ]);
});

test('rejects invalid provider shapes and bounds pages while iterating', async () => {
  const adapter = createNetlifyContactIndexAdapters({
    environment: 'test',
    maxIds: 1,
    getStore: () => ({
      setJSON: async () => ({modified: 'yes'}),
      list: () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            blobs: [
              {key: `members/${token}/${id1}`},
              {key: `members/${token}/${id2}`}
            ],
            directories: []
          };
        }
      })
    })
  });
  await assert.rejects(adapter.putIfNew(`${token}/${id1}`), /write unverified/);
  await assert.rejects(adapter.listByPrefix(`${token}/`), /list limit/);
  await assert.rejects(adapter.listByPrefix('raw-email@example.invalid/'), TypeError);
});

test('installed SDK transports create-only membership and prefix listing', async t => {
  assert.equal(require('@netlify/blobs/package.json').version, '11.1.1');
  const {getStore} = await import('@netlify/blobs');
  const requests = [];
  let puts = 0;
  t.mock.method(globalThis, 'fetch', () => { throw new Error('No real network allowed'); });
  const fetchImpl = async (input, options) => {
    const url = new URL(input);
    requests.push({url, method: options.method, headers: options.headers});
    if (options.method === 'put') {
      puts += 1;
      return puts === 1
        ? new Response(null, {status: 200, headers: {etag: 'synthetic-etag'}})
        : new Response(null, {status: 412});
    }
    if (options.method === 'get') {
      if (url.searchParams.get('cursor') === 'second-page') {
        return Response.json({
          blobs: [{key: `members/${token}/${id2}`, etag: 'second-etag'}],
          directories: []
        });
      }
      return Response.json({
        blobs: [{key: `members/${token}/${id1}`, etag: 'synthetic-etag'}],
        directories: [],
        next_cursor: 'second-page'
      });
    }
    throw new Error('Unexpected synthetic transport');
  };
  const adapter = createNetlifyContactIndexAdapters({
    environment: 'production',
    getStore: options => getStore({
      ...options,
      siteID: 'synthetic-site',
      token: 'synthetic-not-a-credential',
      edgeURL: 'https://cached.example.invalid',
      uncachedEdgeURL: 'https://strong.example.invalid',
      fetch: fetchImpl
    })
  });
  assert.deepEqual(await adapter.putIfNew(`${token}/${id1}`), {modified: true});
  assert.deepEqual(await adapter.putIfNew(`${token}/${id1}`), {modified: false});
  assert.deepEqual(await adapter.listByPrefix(`${token}/`), [
    `${token}/${id1}`,
    `${token}/${id2}`
  ]);
  assert.deepEqual(requests.map(request => request.method), ['put', 'put', 'get', 'get']);
  assert.equal(requests[0].headers['if-none-match'], '*');
  assert.equal(requests[1].headers['if-none-match'], '*');
  assert.equal(requests[2].url.searchParams.get('prefix'), `members/${token}/`);
  assert.equal(requests[3].url.searchParams.get('cursor'), 'second-page');
  assert.ok(requests.every(request => request.url.pathname.includes('/region:eu-central-1/')));
  assert.ok(requests.every(request => request.url.pathname.includes(
    '/site:cobro-pilot-contact-index-production-v1'
  )));
});
