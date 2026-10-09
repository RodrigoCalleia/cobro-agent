'use strict';

const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u;
const opaqueRefPattern = /^[a-z0-9][a-z0-9._:-]{0,63}$/u;
const sitePattern = /^[a-z0-9][a-z0-9-]{0,62}$/u;
const action = 'contact-index.repair-one';
const reasonCode = 'reconciliation-missing-membership';
const commandSchema = 'repair-command-v1';
const auditSchema = 'repair-audit-v1';
const maxAuthorizationLifetimeMs = 5 * 60 * 1000;
const maxClaimLifetimeMs = 60 * 1000;
const outcomes = new Set(['indexed-confirmed', 'suppressed', 'unverified']);

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

function isoFromClock(clock) {
  const value = clock();
  if (!Number.isSafeInteger(value)) return null;
  try { return {value, iso: new Date(value).toISOString()}; }
  catch { return null; }
}

function createPilotOperatorRepair({
  authorize,
  audit,
  repair,
  environment,
  siteId,
  policyVersion,
  clock = Date.now,
  check = () => {}
} = {}) {
  const auditSnapshot = snapshotExactData(audit, ['claim', 'complete']);
  if (typeof authorize !== 'function' || typeof repair !== 'function' || typeof clock !== 'function' ||
      typeof check !== 'function' || auditSnapshot === null ||
      typeof auditSnapshot.claim !== 'function' || typeof auditSnapshot.complete !== 'function' ||
      environment !== 'production' || typeof siteId !== 'string' || !sitePattern.test(siteId) ||
      typeof policyVersion !== 'string' || !opaqueRefPattern.test(policyVersion)) {
    throw new TypeError('Unsupported operator repair configuration');
  }
  const auditReceiver = audit;
  audit = Object.freeze({
    claim: event => Reflect.apply(auditSnapshot.claim, auditReceiver, [event]),
    complete: event => Reflect.apply(auditSnapshot.complete, auditReceiver, [event])
  });

  async function execute(input) {
    let command;
    try {
      const candidate = snapshotExactData(input, ['schema_version', 'operation_id', 'request_id',
        'action', 'environment', 'site_id', 'reason_code', 'ticket_ref', 'policy_version']);
      if (candidate === null || candidate.schema_version !== commandSchema ||
          typeof candidate.operation_id !== 'string' || !uuidPattern.test(candidate.operation_id) ||
          typeof candidate.request_id !== 'string' || !uuidPattern.test(candidate.request_id) ||
          candidate.action !== action || candidate.environment !== environment ||
          candidate.site_id !== siteId || candidate.reason_code !== reasonCode ||
          typeof candidate.ticket_ref !== 'string' || !opaqueRefPattern.test(candidate.ticket_ref) ||
          candidate.policy_version !== policyVersion) {
        return Object.freeze({state: 'rejected'});
      }
      command = Object.freeze({
        schema_version: commandSchema,
        operation_id: candidate.operation_id,
        request_id: candidate.request_id,
        action,
        environment,
        site_id: siteId,
        reason_code: reasonCode,
        ticket_ref: candidate.ticket_ref,
        policy_version: policyVersion
      });
    } catch {
      return Object.freeze({state: 'rejected'});
    }
    try { check(); }
    catch { return Object.freeze({state: 'unverified'}); }

    let authorization;
    try {
      const rawDecision = await authorize(command);
      check();
      const denied = snapshotExactData(rawDecision, ['state']);
      if (denied !== null && denied.state === 'denied') {
        return Object.freeze({state: 'rejected'});
      }
      const decision = snapshotExactData(rawDecision,
        ['state', 'actor_ref', 'authorization_id', 'issued_at', 'expires_at']);
      if (decision === null ||
          decision.state !== 'authorized' || typeof decision.actor_ref !== 'string' ||
          !opaqueRefPattern.test(decision.actor_ref) ||
          typeof decision.authorization_id !== 'string' ||
          !uuidPattern.test(decision.authorization_id)) {
        return Object.freeze({state: 'unverified'});
      }
      const issuedAt = exactIso(decision.issued_at);
      const expiresAt = exactIso(decision.expires_at);
      const now = isoFromClock(clock);
      if (issuedAt === null || expiresAt === null || now === null || issuedAt > now.value ||
          expiresAt <= now.value || expiresAt - issuedAt > maxAuthorizationLifetimeMs ||
          expiresAt > now.value + maxAuthorizationLifetimeMs) {
        return Object.freeze({state: 'rejected'});
      }
      authorization = Object.freeze({
        actor_ref: decision.actor_ref,
        authorization_id: decision.authorization_id,
        expires_at_ms: expiresAt
      });
    } catch {
      return Object.freeze({state: 'unverified'});
    }

    const started = isoFromClock(clock);
    if (started === null || started.value >= authorization.expires_at_ms) {
      return Object.freeze({state: 'rejected'});
    }
    const startEvent = Object.freeze({
      schema_version: auditSchema,
      event: 'started',
      operation_id: command.operation_id,
      request_id: command.request_id,
      action,
      environment,
      site_id: siteId,
      reason_code: reasonCode,
      ticket_ref: command.ticket_ref,
      policy_version: policyVersion,
      actor_ref: authorization.actor_ref,
      authorization_id: authorization.authorization_id,
      server_at: started.iso
    });
    let claimId, claimExpiresAt;
    try {
      const rawClaim = await audit.claim(startEvent);
      check();
      const terminal = snapshotExactData(rawClaim,
        ['state', 'outcome', 'request_id', 'actor_ref', 'policy_version']);
      if (terminal !== null && terminal.state === 'completed' && outcomes.has(terminal.outcome) &&
          terminal.request_id === command.request_id &&
          terminal.actor_ref === authorization.actor_ref && terminal.policy_version === policyVersion) {
        return Object.freeze({state: 'completed', outcome: terminal.outcome});
      }
      const busy = snapshotExactData(rawClaim, ['state']);
      if (busy !== null && busy.state === 'busy') {
        return Object.freeze({state: 'unverified'});
      }
      const claim = snapshotExactData(rawClaim, ['state', 'claim_id', 'claim_expires_at',
        'request_id', 'actor_ref', 'policy_version']);
      if (claim === null ||
          claim.state !== 'claimed' || typeof claim.claim_id !== 'string' ||
          !uuidPattern.test(claim.claim_id) || claim.request_id !== command.request_id ||
          claim.actor_ref !== authorization.actor_ref || claim.policy_version !== policyVersion) {
        return Object.freeze({state: 'unverified'});
      }
      const claimedAt = isoFromClock(clock);
      claimExpiresAt = exactIso(claim.claim_expires_at);
      if (claimedAt === null || claimExpiresAt === null || claimExpiresAt <= claimedAt.value ||
          claimExpiresAt > claimedAt.value + maxClaimLifetimeMs ||
          claimExpiresAt > authorization.expires_at_ms) return Object.freeze({state: 'unverified'});
      claimId = claim.claim_id;
    } catch {
      return Object.freeze({state: 'unverified'});
    }

    let outcome = 'unverified';
    try {
      const beforeRepair = isoFromClock(clock);
      if (beforeRepair !== null && beforeRepair.value < authorization.expires_at_ms &&
          beforeRepair.value < claimExpiresAt) {
        const rawResult = await repair(command.request_id);
        check();
        const result = snapshotExactData(rawResult, ['state']);
        if (result !== null && outcomes.has(result.state)) outcome = result.state;
      }
    } catch {}

    try {
      check();
      const completed = isoFromClock(clock);
      if (completed === null || completed.value >= claimExpiresAt) {
        return Object.freeze({state: 'unverified'});
      }
      const rawRecorded = await audit.complete(Object.freeze({
        schema_version: auditSchema,
        event: 'completed',
        operation_id: command.operation_id,
        claim_id: claimId,
        outcome,
        server_at: completed.iso
      }));
      check();
      const recorded = snapshotExactData(rawRecorded, ['recorded']);
      if (recorded === null || recorded.recorded !== true) {
        return Object.freeze({state: 'unverified'});
      }
    } catch {
      return Object.freeze({state: 'unverified'});
    }
    return Object.freeze({state: 'completed', outcome});
  }

  return Object.freeze({execute});
}

module.exports = {createPilotOperatorRepair};
