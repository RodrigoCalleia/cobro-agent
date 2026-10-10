# Operator repair authorization contract — 2026-10-09

## Result

Continued [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch. Added a disconnected operator gate and documented contract for the existing single-ID repair primitive.

- The exact command is bound to one operation/request, fixed write action, production environment, configured site, fixed reason and policy version.
- Authorization comes from a trusted injected verifier, identifies the operator only by opaque reference and expires within five minutes.
- A durable audit `started` claim is required before repair. A 60-second exclusive lease prevents concurrent replay; a later lease can recover an incomplete attempt through the idempotent repair.
- Claim and stored terminal responses must match the request, actor and policy. A stale claim cannot append a terminal event.
- Audit events exclude contacts, contact tokens, secrets, provider bodies/URLs and raw errors. Outputs are bounded to rejected, unverified or a recorded terminal repair outcome.
- The gate is not imported by a public function, scheduler, browser asset or the existing rights runtime. It has no production authorizer or audit adapter.

## Independent review

An independent read-only audit required target-bound authorization, atomic replay protection, durable start/terminal events, recovery after uncertain terminal writes, one shared deadline and privacy-safe logs. It reproduced an accessor-based privacy bug that could swap a validated ticket/actor value before logging. The implementation was corrected to accept only data properties and snapshot each external object once. Claim binding and stale-lease completion checks were also added from the audit findings.

## Verification

- New operator-contract tests: **14/14 passed**.
- Complete Node suite: **272/272 passed**, zero failures.
- Static build passed and produced exactly `index.html` and `cobro-engine.js`.
- Import inspection found the new module only in its server file and tests; public functions and demo assets do not import it.
- All tests use synthetic UUIDs, opaque references, clocks and in-memory collaborators. No provider, customer or real operator data was created.

## Limits and blockers

This is an interface contract, not an activated executor. A production audit adapter must atomically bind operation IDs to the original command, enforce exclusive live claims and reject stale completion. A trusted authentication/authorization source, shared end-to-end deadline, rate limits, audit retention/access rules, secret loading and provider acceptance remain required. Capture remains unconditionally unavailable.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Prepare and test a disconnected append-only audit-store adapter with atomic operation claim semantics using only synthetic transports. Do not connect the operator gate, schedule repairs or enable capture.
