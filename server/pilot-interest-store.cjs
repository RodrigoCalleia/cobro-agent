'use strict';
const {isDeepStrictEqual} = require('node:util');
const {validatePilotInterest} = require('./validate-pilot-interest.cjs');
const idPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const fields = new Set(['contact_email', 'business_name', 'contact_permission', 'request_id', 'received_at', 'notice_version']);
const suppression = Object.freeze({state: 'suppressed'});
const storageRegion = 'eu-central-1';

function validId(id) { return typeof id === 'string' && idPattern.test(id); }
function isSuppression(value) { return isDeepStrictEqual(value, suppression); }
function logicalRecord(record) {
  const {received_at: ignored, ...identity} = record;
  return identity;
}
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
  const store = getStore({
    name: `cobro-pilot-interest-${environment}-v1`,
    consistency: 'strong',
    region: storageRegion
  });
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
        // A suppression marker wins over new and delayed retries. It contains no
        // contact data and remains at the same key so onlyIfNew cannot recreate it.
        if (isSuppression(stored)) return {state: 'suppressed'};
        let storedValue;
        try { storedValue = canonicalRecord(stored); }
        catch { return {state: 'conflict'}; }
        if (!isDeepStrictEqual(storedValue, stored)) return {state: 'conflict'};
        const matches = write.modified
          ? isDeepStrictEqual(storedValue, value)
          : isDeepStrictEqual(logicalRecord(storedValue), logicalRecord(value)) &&
            Date.parse(storedValue.received_at) <= Date.parse(value.received_at);
        if (!matches) return {state: 'conflict'};
        return {state: 'stored-confirmed', request_id: value.request_id, created: write.modified};
      } catch {
        return {state: 'received-unverified'};
      }
    },
    // Private operator use only; never expose through an unauthenticated read route.
    read,
    // Rights-workflow primitive: atomically replace contact data with a minimal
    // marker. Unlike delete(), retaining the key prevents an in-flight or replayed
    // create-only write from resurrecting the record. Operator authorization,
    // complete contact lookup and retention policy remain external requirements.
    async suppress(id) {
      const key = keyFor(id);
      try {
        const write = await store.setJSON(key, suppression);
        const stored = await read(id);
        return write && write.modified === true && isSuppression(stored)
          ? {state: 'suppressed-confirmed'} : {state: 'suppression-unverified'};
      } catch {
        return {state: 'suppression-unverified'};
      }
    },
    async delete(id) {
      const key = keyFor(id);
      // Physical deletion is test-fixture cleanup only. Production keeps the
      // minimal suppression marker so delayed/replayed create-only writes cannot
      // recreate contact data. Never use this method for a rights request.
      if (environment !== 'test') return {state: 'delete-unavailable'};
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

