'use strict';
const {isDeepStrictEqual} = require('node:util');
const {validatePilotInterest} = require('./validate-pilot-interest.cjs');
const idPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const fields = new Set(['contact_email', 'business_name', 'contact_permission', 'request_id', 'received_at', 'notice_version']);

function validId(id) { return typeof id === 'string' && idPattern.test(id); }
function canonicalRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(record)) ||
      Reflect.ownKeys(record).some(key => !fields.has(key))) throw new TypeError('Invalid private record');
  const payload = {};
  for (const name of ['contact_email', 'business_name', 'contact_permission']) {
    if (Object.hasOwn(record, name)) payload[name] = record[name];
  }
  const checked = validatePilotInterest(payload);
  if (!checked.ok || !Object.hasOwn(record, 'request_id') || !validId(record.request_id) ||
      !Object.hasOwn(record, 'notice_version') || typeof record.notice_version !== 'string' ||
      !/^[a-z0-9][a-z0-9._-]{0,63}$/u.test(record.notice_version) ||
      !Object.hasOwn(record, 'received_at') || typeof record.received_at !== 'string') throw new TypeError('Invalid private record');
  const date = new Date(record.received_at);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== record.received_at) throw new TypeError('Invalid private record');
  return {...checked.value, request_id: record.request_id, received_at: record.received_at, notice_version: record.notice_version};
}

// Server-only adapter, not an endpoint. getStore is supplied by a future SDK integration.
// All arguments, IDs and metadata must be chosen by authenticated/trusted server code.
function createPilotInterestStore({getStore, environment}) {
  if (!['production', 'test'].includes(environment) || typeof getStore !== 'function') throw new TypeError('Unsupported storage context');
  const store = getStore({name: `cobro-pilot-interest-${environment}-v1`, consistency: 'strong'});
  if (!store || ['setJSON', 'get', 'delete'].some(method => typeof store[method] !== 'function')) throw new TypeError('Unsupported storage adapter');
  const keyFor = id => { if (!validId(id)) throw new TypeError('Invalid private record identifier'); return `requests/${id}`; };
  const read = id => store.get(keyFor(id), {type: 'json', consistency: 'strong'});
  return {
    // Retry the same trusted record/ID; onlyIfNew prevents replacing an existing request.
    async create(record) {
      const value = canonicalRecord(record);
      const key = keyFor(value.request_id);
      try {
        const write = await store.setJSON(key, value, {onlyIfNew: true});
        const stored = await read(value.request_id);
        if (!write || typeof write.modified !== 'boolean' || stored === null) return {state: 'received-unverified'};
        if (!isDeepStrictEqual(stored, value)) return {state: 'conflict'};
        return {state: 'stored-confirmed', request_id: value.request_id, created: write.modified};
      } catch {
        return {state: 'received-unverified'};
      }
    },
    // Private operator use only; never expose through an unauthenticated read route.
    read,
    async delete(id) {
      const key = keyFor(id);
      try {
        await store.delete(key);
        return {state: await read(id) === null ? 'deleted-confirmed' : 'delete-unverified'};
      } catch {
        return {state: 'delete-unverified'};
      }
    }
  };
}

module.exports = {createPilotInterestStore};
