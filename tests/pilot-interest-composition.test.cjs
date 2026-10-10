'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotInterestController} = require('../client/pilot-interest-controller.js');
const {createPilotInterestProcessor} = require('../server/process-pilot-interest.cjs');
const {createPilotInterestStore} = require('../server/pilot-interest-store.cjs');

test('injected browser/server composition preserves a lost-response retry and requires a fresh notice decision', async () => {
  const origin = 'https://pilot.example.test', values = new Map();
  const tokens = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'];
  let tick = 0, requests = 0;
  const processor = noticeVersion => createPilotInterestProcessor({
    allowedOrigin: origin, noticeVersion, secret: new Uint8Array(32).fill(8),
    now: () => new Date(Date.UTC(2026, 9, 7, 19, 0, tick++)),
    openStore: () => createPilotInterestStore({environment: 'test', getStore: () => ({
      async setJSON(key, value) {
        if (values.has(key)) return {modified: false};
        values.set(key, structuredClone(value)); return {modified: true};
      },
      async get(key) { return values.has(key) ? structuredClone(values.get(key)) : null; },
      async delete(key) { values.delete(key); }
    })})
  });
  let process = processor('synthetic-v1');
  const transport = async envelope => {
    requests++;
    // Synthetic request/transport only. No fetch, account, provider or real data.
    const response = await process(new Request(`${origin}/api/pilot-interest`, {
      method: envelope.method, headers: {...envelope.headers, Origin: origin},
      body: envelope.body, signal: envelope.signal
    }));
    if (requests === 1) throw new Error('Synthetic response lost after confirmed persistence');
    return {status: response.status, body: await response.json()};
  };
  const draft = {contact_email: 'synthetic@example.test', business_name: 'Fictional Agency', contact_permission: true};
  const controller = createPilotInterestController({noticeVersion: 'synthetic-v1',
    generateToken: () => tokens.shift(), transport});
  controller.setDraft(draft);
  assert.equal((await controller.submit()).state, 'received-unverified');
  assert.equal(values.size, 1);
  const originalTime = [...values.values()][0].received_at;
  assert.equal((await controller.submit()).state, 'stored-confirmed');
  assert.equal(values.size, 1);
  assert.equal([...values.values()][0].received_at, originalTime);
  controller.setDraft({...draft, business_name: 'Other Fictional Agency'});
  assert.equal((await controller.submit()).state, 'stored-confirmed');
  assert.equal(values.size, 2);

  process = processor('synthetic-v2');
  const stale = createPilotInterestController({noticeVersion: 'synthetic-v1', transport,
    generateToken: () => '33333333-3333-4333-8333-333333333333'});
  stale.setDraft(draft);
  assert.equal((await stale.submit()).code, 'notice_mismatch');
  const calls = requests;
  stale.setDraft(draft); await stale.submit(); assert.equal(requests, calls);
  stale.replaceNotice('synthetic-v2'); await stale.submit(); assert.equal(requests, calls);
  stale.setDraft(draft);
  assert.equal((await stale.submit()).state, 'stored-confirmed');
  assert.equal(values.size, 3);
});
