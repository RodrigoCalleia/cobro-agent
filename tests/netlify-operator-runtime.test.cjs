'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {openPublishedOperatorRepair} = require('../server/netlify-operator-runtime.cjs');

const published = {deploy: {context: 'production', published: true}, site: {name: 'cobro-agent-rodrigo', id: 'synthetic-site'}};
const keyring = {active: {version: 'k1', secret: Buffer.alloc(32, 0x41)}};
const command = {
  schema_version: 'repair-command-v1', operation_id: '11111111-1111-4111-8111-111111111111',
  request_id: '22222222-2222-4222-8222-222222222222', action: 'contact-index.repair-one',
  environment: 'production', site_id: 'cobro-agent-rodrigo',
  reason_code: 'reconciliation-missing-membership', ticket_ref: 'reconciliation:synthetic-1',
  policy_version: 'operator-repair-v1'
};

function fakeSDK() {
  const audit = {setJSON: async () => ({etag: 'e1', modified: true}), getWithMetadata: async () => null};
  const rights = {
    setJSON: async () => ({modified: false}), get: async () => null,
    delete: async () => ({deleted: false}), list: async function* () { yield {blobs: [], directories: []}; }
  };
  return {getStore: options => options.name.includes('operator-audit') ? audit : rights};
}

test('opens only for the published production site and shares the deadline with authorization', async () => {
  let calls = 0;
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    loadSDK: async () => fakeSDK(), fetchImpl: async () => new Response('{}'),
    authorize: async value => { calls += 1; assert.equal(value.request_id, command.request_id); return {state: 'denied'}; }
  });
  assert.deepEqual(await runtime.execute(command), {state: 'rejected'});
  assert.equal(calls, 1);
});

test('a stalled SDK load consumes the single budget and never authorizes or repairs', async () => {
  let authorized = false;
  const runtime = await openPublishedOperatorRepair(published, keyring, {
    timeoutMs: 20, loadSDK: () => new Promise(() => {}), fetchImpl: async () => new Response('{}'),
    authorize: async () => { authorized = true; return {state: 'denied'}; }
  });
  assert.deepEqual(await runtime.execute(command), {state: 'unverified'});
  assert.equal(authorized, false);
});

test('invalid contexts and unbounded budgets fail before opening SDK', async () => {
  for (const context of [{}, {deploy: {context: 'deploy-preview', published: true}, site: published.site}]) {
    await assert.rejects(openPublishedOperatorRepair(context, keyring, {
      authorize: async () => ({state: 'denied'}), fetchImpl: async () => new Response('{}')
    }), /Unsupported operator repair context/);
  }
  await assert.rejects(openPublishedOperatorRepair(published, keyring, {
    timeoutMs: 10001, authorize: async () => ({state: 'denied'}), fetchImpl: async () => new Response('{}')
  }), /Unsupported operator repair deadline/);
});
