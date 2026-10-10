# Reconciliation shared deadline — 2026-10-09

## Result

Continued [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its existing isolated branch. Added a disconnected production-context runtime for the private reconciliation planner with one abortable end-to-end deadline per plan.

- The deadline starts before SDK loading and covers construction, request inventory pages, strong request reads, contact-index pages, SDK retries and response-body consumption.
- Both Netlify stores receive the same guarded fetch within one plan, so the budget cannot reset per page, record, contact or retained key version.
- Concurrent and later plans receive independent controllers. Expiration of one plan cannot abort another.
- Deadline expiry returns only the exact frozen `{state: "unverified"}` result. Late SDK loads, reads or page bodies cannot produce `ready` or start follow-up storage requests.
- The runtime accepts only the trusted published production context for this site. It is not imported by the disabled public function and performs no write, repair, suppression or deletion.

The shared deadline helper now supplies its monotonic active-state check to an operation. The runtime uses that check immediately after asynchronous SDK loading, preventing a late SDK result from opening stores after its budget has closed.

## Independent review

An independent read-only audit required one budget around the complete plan rather than separate per-operation timers. It also required SDK load coverage, guarded transport injection into both stores, late-result rejection and isolated concurrent controllers. Its post-implementation review approved the result with no persistence blocker and independently repeated the 33 combined deadline/SDK tests.

## Verification

- New runtime deadline tests: **8/8 passed**.
- Combined reconciliation and existing storage-deadline tests: **33/33 passed**.
- Complete Node suite: **253/253 passed**, zero failures.
- Static build passed and produced exactly `index.html` and `cobro-engine.js`.
- Import inspection found the new runtime only in its private server module and tests, not in `netlify/`, the demo page or browser engine.
- Tests use the pinned Netlify Blobs SDK with synthetic URLs, IDs, contact and secret. Global network access is blocked and no provider record is created.

## Limits and blockers

This runtime is not wired to a route, scheduler or operator UI. It only makes the read-only plan time-bounded; the plan remains a non-atomic advisory snapshot. A future repair executor must re-read and bind each exact request immediately before an idempotent create-only membership write.

Operator authentication, real secret loading/rotation retention, approved notice/responsible party/contact channel, provider acceptance and remaining privacy controls are still required before capture activation. Capture remains unconditionally unavailable.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Prepare a disconnected single-ID repair primitive that revalidates the current request and existing memberships immediately before an idempotent create-only write. Test only with synthetic stores; do not schedule it or enable capture.
