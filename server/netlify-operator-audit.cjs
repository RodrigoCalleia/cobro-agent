'use strict';

const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const opaqueRefPattern = /^[a-z0-9][a-z0-9._:-]{0,63}$/u;
const sitePattern = /^[a-z0-9][a-z0-9-]{0,62}$/u;
const outcomes = new Set(['indexed-confirmed', 'suppressed', 'unverified']);
const storageRegion = 'eu-central-1';
const leaseMs = 60 * 1000;
const allowedClockSkewMs = 5000;
const maxAttempts = 8;
const maxConflicts = 3;

function verifiedOperatorAuditFetch(fetchImpl) {
  if (typeof fetchImpl !== 'function') throw new TypeError('Unsupported operator audit transport');
  return async (input, options) => {
    const response = await fetchImpl(input, options);
    if (options?.method?.toUpperCase() === 'PUT' && ![200, 412].includes(response.status)) {
      throw new Error('Private operator audit write unverified');
    }
    return response;
  };
}

function snapshotExactData(value, keys) {
  try {
    if (value === null || typeof value !== 'object' || Array.isArray(value) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
        Reflect.ownKeys(value).length !== keys.length) return null;
    const snapshot = {};
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) return null;
      snapshot[key] = descriptor.value;
    }
    return snapshot;
  } catch { return null; }
}

function exactIso(value) {
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  try { return new Date(parsed).toISOString() === value ? parsed : null; }
  catch { return null; }
}

function validateStart(value) {
  const event = snapshotExactData(value, ['schema_version', 'event', 'operation_id', 'request_id',
    'action', 'environment', 'site_id', 'reason_code', 'ticket_ref', 'policy_version',
    'actor_ref', 'authorization_id', 'authorization_expires_at', 'server_at']);
  if (event === null || event.schema_version !== 'repair-audit-v1' || event.event !== 'started' ||
      typeof event.operation_id !== 'string' || !uuidPattern.test(event.operation_id) ||
      typeof event.request_id !== 'string' || !uuidPattern.test(event.request_id) ||
      event.action !== 'contact-index.repair-one' ||
      !['production', 'test'].includes(event.environment) ||
      typeof event.site_id !== 'string' || !sitePattern.test(event.site_id) ||
      event.reason_code !== 'reconciliation-missing-membership' ||
      typeof event.ticket_ref !== 'string' || !opaqueRefPattern.test(event.ticket_ref) ||
      typeof event.policy_version !== 'string' || !opaqueRefPattern.test(event.policy_version) ||
      typeof event.actor_ref !== 'string' || !opaqueRefPattern.test(event.actor_ref) ||
      typeof event.authorization_id !== 'string' || !uuidPattern.test(event.authorization_id) ||
      exactIso(event.authorization_expires_at) === null || exactIso(event.server_at) === null) {
    throw new TypeError('Invalid operator audit start');
  }
  return event;
}

function validateCompletion(value) {
  const event = snapshotExactData(value, ['schema_version', 'event', 'operation_id', 'claim_id',
    'outcome', 'server_at']);
  if (event === null || event.schema_version !== 'repair-audit-v1' || event.event !== 'completed' ||
      typeof event.operation_id !== 'string' || !uuidPattern.test(event.operation_id) ||
      typeof event.claim_id !== 'string' || !uuidPattern.test(event.claim_id) ||
      !outcomes.has(event.outcome) || exactIso(event.server_at) === null) {
    throw new TypeError('Invalid operator audit completion');
  }
  return event;
}

function makeBinding(event) {
  return Object.freeze({
    operation_id: event.operation_id,
    request_id: event.request_id,
    action: event.action,
    environment: event.environment,
    site_id: event.site_id,
    reason_code: event.reason_code,
    ticket_ref: event.ticket_ref,
    policy_version: event.policy_version,
    actor_ref: event.actor_ref
  });
}

function sameBinding(left, right) {
  return ['operation_id', 'request_id', 'action', 'environment', 'site_id', 'reason_code',
    'ticket_ref', 'policy_version', 'actor_ref'].every(key => left[key] === right[key]);
}

function createNetlifyOperatorAudit({
  getStore,
  environment,
  randomUUID = () => globalThis.crypto.randomUUID(),
  clock = Date.now
} = {}) {
  if (!['production', 'test'].includes(environment) || typeof getStore !== 'function' ||
      typeof randomUUID !== 'function' || typeof clock !== 'function') {
    throw new TypeError('Unsupported operator audit context');
  }
  const store = getStore({
    name: `cobro-pilot-operator-audit-${environment}-v1`,
    consistency: 'strong',
    region: storageRegion
  });
  const storeShape = snapshotExactData(store, ['setJSON', 'getWithMetadata']);
  if (storeShape === null || typeof storeShape.setJSON !== 'function' ||
      typeof storeShape.getWithMetadata !== 'function') {
    throw new TypeError('Unsupported operator audit adapter');
  }
  const setJSON = (...args) => Reflect.apply(storeShape.setJSON, store, args);
  const getWithMetadata = (...args) => Reflect.apply(storeShape.getWithMetadata, store, args);

  function trustedNow(eventIso) {
    const now = clock();
    const eventTime = exactIso(eventIso);
    if (!Number.isSafeInteger(now) || eventTime === null ||
        Math.abs(now - eventTime) > allowedClockSkewMs) {
      throw new Error('Private operator audit clock unverified');
    }
    return now;
  }

  function parseBinding(value) {
    const binding = snapshotExactData(value, ['operation_id', 'request_id', 'action', 'environment',
      'site_id', 'reason_code', 'ticket_ref', 'policy_version', 'actor_ref']);
    if (binding === null || typeof binding.operation_id !== 'string' ||
        !uuidPattern.test(binding.operation_id) || typeof binding.request_id !== 'string' ||
        !uuidPattern.test(binding.request_id) || binding.action !== 'contact-index.repair-one' ||
        binding.environment !== environment ||
        typeof binding.site_id !== 'string' || !sitePattern.test(binding.site_id) ||
        binding.reason_code !== 'reconciliation-missing-membership' ||
        typeof binding.ticket_ref !== 'string' || !opaqueRefPattern.test(binding.ticket_ref) ||
        typeof binding.policy_version !== 'string' || !opaqueRefPattern.test(binding.policy_version) ||
        typeof binding.actor_ref !== 'string' || !opaqueRefPattern.test(binding.actor_ref)) return null;
    return binding;
  }

  function parseEvent(value) {
    const claimed = snapshotExactData(value, ['type', 'claim_id', 'authorization_id', 'server_at',
      'claim_expires_at']);
    if (claimed !== null && claimed.type === 'claimed' &&
        typeof claimed.claim_id === 'string' && uuidPattern.test(claimed.claim_id) &&
        typeof claimed.authorization_id === 'string' && uuidPattern.test(claimed.authorization_id) &&
        exactIso(claimed.server_at) !== null && exactIso(claimed.claim_expires_at) !== null) {
      return claimed;
    }
    const completed = snapshotExactData(value, ['type', 'claim_id', 'outcome', 'server_at']);
    if (completed !== null && completed.type === 'completed' &&
        typeof completed.claim_id === 'string' && uuidPattern.test(completed.claim_id) &&
        outcomes.has(completed.outcome) && exactIso(completed.server_at) !== null) return completed;
    return null;
  }

  function parseDocument(value) {
    const document = snapshotExactData(value, ['schema_version', 'binding', 'events']);
    if (document === null || document.schema_version !== 'repair-audit-document-v1' ||
        !Array.isArray(document.events) || document.events.length < 1 ||
        document.events.length > maxAttempts + 1) return null;
    const binding = parseBinding(document.binding);
    if (binding === null) return null;
    const events = [];
    let claims = 0, terminal = false, previousClaim = null;
    const claimIds = new Set();
    for (const raw of document.events) {
      const event = parseEvent(raw);
      if (event === null || terminal) return null;
      if (event.type === 'claimed') {
        const startedAt = exactIso(event.server_at);
        const expiresAt = exactIso(event.claim_expires_at);
        if (claimIds.has(event.claim_id) || expiresAt <= startedAt ||
            expiresAt - startedAt > leaseMs ||
            (previousClaim !== null && startedAt < exactIso(previousClaim.claim_expires_at))) {
          return null;
        }
        claimIds.add(event.claim_id);
        previousClaim = event;
        claims += 1;
      }
      else {
        terminal = true;
        const completedAt = exactIso(event.server_at);
        if (claims === 0 || event.claim_id !== previousClaim?.claim_id ||
            completedAt < exactIso(previousClaim.server_at) ||
            completedAt >= exactIso(previousClaim.claim_expires_at)) return null;
      }
      events.push(event);
    }
    if (claims < 1 || claims > maxAttempts) return null;
    return {binding, events};
  }

  async function readOperation(key) {
    const raw = await getWithMetadata(key, {type: 'json', consistency: 'strong'});
    if (raw === null) return null;
    const result = snapshotExactData(raw, ['data', 'etag', 'metadata']);
    if (result === null || typeof result.etag !== 'string' || !result.etag ||
        result.etag.length > 256 || result.metadata === null ||
        typeof result.metadata !== 'object' || Array.isArray(result.metadata)) {
      throw new Error('Private operator audit read unverified');
    }
    const document = parseDocument(result.data);
    if (document === null) throw new Error('Private operator audit document unverified');
    return {document, etag: result.etag};
  }

  async function conditionalWrite(key, document, condition) {
    const result = await setJSON(key, document, condition);
    const short = snapshotExactData(result, ['modified']);
    const full = snapshotExactData(result, ['etag', 'modified']);
    const write = short ?? full;
    if (write === null || typeof write.modified !== 'boolean' ||
        (write.modified && (full === null || typeof full.etag !== 'string' || !full.etag))) {
      throw new Error('Private operator audit write unverified');
    }
    return write.modified;
  }

  function sameDocument(left, right) {
    if (!sameBinding(left.binding, right.binding) || left.events.length !== right.events.length) {
      return false;
    }
    return left.events.every((event, index) => {
      const other = right.events[index];
      const keys = event.type === 'claimed'
        ? ['type', 'claim_id', 'authorization_id', 'server_at', 'claim_expires_at']
        : ['type', 'claim_id', 'outcome', 'server_at'];
      return keys.length === Reflect.ownKeys(other).length &&
        keys.every(key => event[key] === other[key]);
    });
  }

  function currentNow() {
    const now = clock();
    if (!Number.isSafeInteger(now)) throw new Error('Private operator audit clock unverified');
    return now;
  }

  function terminalResult(parsed, binding) {
    const terminal = parsed.events.at(-1);
    if (terminal.type !== 'completed') return null;
    return Object.freeze({
      state: 'completed', outcome: terminal.outcome,
      request_id: binding.request_id, actor_ref: binding.actor_ref,
      policy_version: binding.policy_version
    });
  }

  function newClaim(event, now) {
    const authorizationExpiry = exactIso(event.authorization_expires_at);
    const authorizationIssued = exactIso(event.server_at);
    if (authorizationExpiry === null || authorizationIssued === null ||
        authorizationExpiry <= now || authorizationExpiry - authorizationIssued > 5 * 60 * 1000) {
      throw new Error('Private operator audit authorization unverified');
    }
    const claimId = randomUUID();
    if (typeof claimId !== 'string' || !uuidPattern.test(claimId)) {
      throw new Error('Private operator audit claim unverified');
    }
    return Object.freeze({
      type: 'claimed', claim_id: claimId, authorization_id: event.authorization_id,
      server_at: new Date(now).toISOString(),
      claim_expires_at: new Date(Math.min(now + leaseMs, authorizationExpiry)).toISOString()
    });
  }

  async function claim(value) {
    const event = validateStart(value);
    if (event.environment !== environment) throw new TypeError('Invalid operator audit environment');
    const now = trustedNow(event.server_at);
    const binding = makeBinding(event);
    const key = `operations/${event.operation_id}`;
    const firstClaim = newClaim(event, now);
    const initial = Object.freeze({
      schema_version: 'repair-audit-document-v1', binding,
      events: Object.freeze([firstClaim])
    });
    if (await conditionalWrite(key, initial, {onlyIfNew: true})) {
      const created = await readOperation(key);
      if (created === null || !sameDocument(created.document, initial) ||
          currentNow() >= exactIso(firstClaim.claim_expires_at)) {
        throw new Error('Private operator audit write unverified');
      }
      return Object.freeze({
        state: 'claimed', claim_id: firstClaim.claim_id,
        claim_expires_at: firstClaim.claim_expires_at, request_id: binding.request_id,
        actor_ref: binding.actor_ref, policy_version: binding.policy_version
      });
    }

    for (let conflict = 0; conflict < maxConflicts; conflict += 1) {
      const current = await readOperation(key);
      if (current === null || !sameBinding(current.document.binding, binding)) {
        throw new Error('Private operator audit binding unverified');
      }
      const terminal = terminalResult(current.document, binding);
      if (terminal) return terminal;
      const last = current.document.events.at(-1);
      if (exactIso(last.claim_expires_at) > now) return Object.freeze({state: 'busy'});
      const attempts = current.document.events.filter(item => item.type === 'claimed').length;
      if (attempts >= maxAttempts) throw new Error('Private operator audit attempt limit');
      const writeNow = currentNow();
      const nextClaim = newClaim(event, writeNow);
      if (current.document.events.some(item => item.type === 'claimed' &&
          item.claim_id === nextClaim.claim_id)) {
        throw new Error('Private operator audit claim unverified');
      }
      const nextDocument = Object.freeze({
        schema_version: 'repair-audit-document-v1', binding: current.document.binding,
        events: Object.freeze([...current.document.events, nextClaim])
      });
      if (!await conditionalWrite(key, nextDocument, {onlyIfMatch: current.etag})) continue;
      const confirmed = await readOperation(key);
      if (confirmed === null || !sameDocument(confirmed.document, nextDocument) ||
          currentNow() >= exactIso(nextClaim.claim_expires_at)) {
        throw new Error('Private operator audit write unverified');
      }
      return Object.freeze({
        state: 'claimed', claim_id: nextClaim.claim_id,
        claim_expires_at: nextClaim.claim_expires_at, request_id: binding.request_id,
        actor_ref: binding.actor_ref, policy_version: binding.policy_version
      });
    }
    throw new Error('Private operator audit conflict limit');
  }

  async function complete(value) {
    const event = validateCompletion(value);
    trustedNow(event.server_at);
    const key = `operations/${event.operation_id}`;
    for (let conflict = 0; conflict < maxConflicts; conflict += 1) {
      const current = await readOperation(key);
      if (current === null) return Object.freeze({recorded: false});
      const existingTerminal = current.document.events.at(-1);
      if (existingTerminal.type === 'completed') {
        return Object.freeze({recorded: existingTerminal.claim_id === event.claim_id &&
          existingTerminal.outcome === event.outcome});
      }
      const writeNow = currentNow();
      if (existingTerminal.claim_id !== event.claim_id ||
          exactIso(existingTerminal.claim_expires_at) <= writeNow) {
        return Object.freeze({recorded: false});
      }
      const completion = Object.freeze({
        type: 'completed', claim_id: event.claim_id, outcome: event.outcome,
        server_at: new Date(writeNow).toISOString()
      });
      const nextDocument = Object.freeze({
        schema_version: 'repair-audit-document-v1', binding: current.document.binding,
        events: Object.freeze([...current.document.events, completion])
      });
      if (!await conditionalWrite(key, nextDocument, {onlyIfMatch: current.etag})) continue;
      const confirmed = await readOperation(key);
      const terminal = confirmed?.document.events.at(-1);
      if (!terminal || !sameDocument(confirmed.document, nextDocument) ||
          currentNow() >= exactIso(existingTerminal.claim_expires_at)) {
        throw new Error('Private operator audit terminal unverified');
      }
      return Object.freeze({recorded: true});
    }
    throw new Error('Private operator audit conflict limit');
  }

  return Object.freeze({claim, complete});
}

module.exports = {createNetlifyOperatorAudit, verifiedOperatorAuditFetch};
