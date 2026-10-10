# Disconnected reconciliation plan — 2026-10-09

## Result

Continued [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its existing isolated branch. Added a private, disconnected inventory plan for the dual-write gap between stored pilot-interest requests and the opaque contact-membership index.

- The request store lists only exact `requests/<UUIDv4>` keys through a bounded paginated iterator. It rejects malformed pages, directories, duplicate IDs, excess blobs and excess empty pages before returning any inventory.
- Each listed request is strongly read and must be either the exact canonical active record bound to its key or the exact minimal suppression marker.
- Active records are compared with current and retained HMAC-token memberships. Repeated contacts share one bounded lookup.
- The final result contains only sorted opaque IDs partitioned as `indexed`, `missingMemberships` and `suppressed`. Any malformed record or provider/list/index failure returns exactly `unverified`, without partial IDs, contacts, tokens or provider details.
- Planning performs no write, suppression, deletion or repair. Suppressed markers cannot be mapped back to erased contacts and are never reconstructed.

## Independent review

An independent read-only audit identified two issues before persistence: an unbounded stream of empty provider pages and repeated index lookups for the same contact. The implementation now caps pages and total blobs and caches membership lookup by canonical contact. The reviewer accepted the disconnected scope with the remaining deadline and revalidation gates below.

## Verification

- Focused reconciliation/store tests: **33/33 passed**.
- Complete Node suite: **245/245 passed**, zero failures.
- Static build passed and produced exactly `index.html` and `cobro-engine.js`.
- Import inspection found the reconciliation modules only in private server modules and tests, not in `netlify/`, the demo page or browser engine.
- All fixtures use synthetic contacts, UUIDs and secrets. No real provider record or network request was used.

## Limits and blockers

This is an advisory, non-atomic snapshot. A future repair executor must re-read the exact request, revalidate its state/contact and use an idempotent create-only membership immediately before writing. Request reads and both request/contact listings also need abortable end-to-end provider deadlines before the planner can be scheduled or activated. Capture remains unconditionally unavailable; no public route or form imports this preparation.

Operator authentication, real secret loading/rotation retention, approved notice/responsible party/contact channel, provider acceptance and the remaining privacy controls are still required before capture activation.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Add abortable shared deadlines to private request and contact listing/read operations with synthetic stalled transports. Do not execute reconciliation repairs or enable capture.
