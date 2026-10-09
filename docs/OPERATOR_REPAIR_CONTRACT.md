# Operator repair contract

Status: disconnected preparation. This contract includes a private audit-store adapter, but does not provide an endpoint, scheduler, identity provider, authorization source or connected runtime.

## Purpose

Permit a future trusted operator to repair one missing private contact-index membership without exposing contact data or granting batch/write access beyond that exact operation.

## Command

The executor accepts one exact, data-only `repair-command-v1` object. It binds a UUID operation and request to:

- action `contact-index.repair-one`;
- environment `production`;
- the configured site ID;
- reason `reconciliation-missing-membership`;
- an opaque ticket reference; and
- the configured policy version.

Extra properties, accessors, free-text reasons, invalid IDs and any target/configuration mismatch are rejected before authorization or storage.

## Authorization

Authorization is a trusted injected decision, not caller-supplied identity. An authorized decision contains only an opaque actor reference, UUID authorization ID and canonical issue/expiry timestamps. Grants cannot be future-issued, expired or valid for more than five minutes. A grant is checked again before repair.

The future verifier must bind its decision to the complete immutable command and must keep reconciliation-read and repair-write permissions separate. No wildcard or batch repair is accepted.

## Atomic claim and recovery

Before repair, the audit adapter atomically claims the operation and durably stores the `started` event. The current Netlify adapter keeps one strongly read, conditionally updated document per operation so binding, lease and terminal state change under one ETag/CAS boundary. It must:

- compare every stable field when an operation ID already exists;
- return `busy` while another live claim exists;
- issue at most one live claim ID for an operation;
- limit a claim to 60 seconds and never beyond authorization expiry;
- return a stored terminal result only for the same request, actor and policy; and
- allow a later exclusive re-claim after an incomplete/expired attempt.

The executor passes the claim ID in the terminal event and refuses to complete after local claim expiry. The adapter must also reject a replaced or expired claim. Recovery may repeat the underlying repair because membership creation is idempotent; it must never delete or roll back a membership.

## Audit data

The `started` event contains schema/event names, operation/request IDs, fixed action, environment/site, fixed reason, opaque ticket/policy/actor/authorization references, authorization expiry and server time. The terminal event contains schema/event names, operation/claim IDs, the bounded outcome and server time.

Each successful CAS appends a logical claim or terminal event and no adapter method lists or deletes records. This is application-level append-only history, not physical WORM or regulatory immutability; provider administrators and retention controls remain outside this contract.

Never record contact/email, contact token/HMAC, secrets, payloads, provider URLs/bodies or raw errors. Retention, access, export and deletion rules for the audit store must be approved before activation.

If start/claim is uncertain, repair does not run. If repair is uncertain, the terminal outcome is `unverified`. If terminal persistence is uncertain or the shared deadline/lease expires, the caller receives only `unverified` and the durable start remains available for controlled recovery.

## Activation blockers

Before any route, job or operator interface can call this executor, the project still needs an authenticated operator identity source, authorization verifier, a connected runtime with one shared abortable budget around SDK loading/authorization/audit/repair, rate limiting, secrets, provider acceptance and approved privacy/retention controls. The conditional transport must accept only verified `200` or conflict `412` writes. The public interest handler must remain unavailable until all capture gates are separately satisfied.
