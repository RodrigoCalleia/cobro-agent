# Private multi-ID rights plan — 2026-10-08

## Outcome

Prepared a disconnected private composition that joins the versioned HMAC keyring, append-only contact index, Netlify index adapter and private request store. It can verify a stored request before indexing it and prepare a deterministic multi-ID suppression plan without executing suppression. No public handler imports this module and capture remains unavailable.

## Implementation

- Added `server/pilot-contact-rights.cjs` with two private operations:
  - `indexStoredRequest` normalizes the contact, verifies the exact canonical stored record and only then creates the opaque membership.
  - `planSuppression` searches active and retained key versions, verifies every referenced request, separates already-suppressed IDs and returns no partial IDs on any mismatch or unavailable read.
- A successful membership result is exposed only as `indexed-confirmed`; it never claims which request created the membership.
- Added `matchContact` to the private request store. Stored email casing is normalized only for comparison after the raw stored record passes exact canonical validation.
- Contact-index writes now require a strong JSON readback of the exact minimal membership marker. A missing or malformed readback cannot confirm indexing.
- Plans contain only sorted opaque request IDs and state. They contain no contact, token, key version, stored record or provider error.

## Verification

- Final focused composition/store/adapter suite: **31/31** passed.
- Complete local suite: **239/239** passed.
- Static build passed and produced exactly two public demo assets.
- Synthetic tests cover multiple IDs, previous-key lookup, already-suppressed records, mixed-case stored contacts, mismatched binding, no partial plan, no suppression side effects and strong membership readback.
- Installed SDK test proves HTTP 400 with no membership readback cannot confirm indexing.
- Independent audit reproduced that SDK 11.1.1 can report `modified:true` for HTTP 400/403/404/429/500/503. The strong readback fixes the false-membership claim; the neutral `indexed-confirmed` state avoids using the SDK result as a creation metric.
- Independent post-fix review approved the disconnected plan-only scope, reran **31/31** focused and **239/239** complete tests plus build, and confirmed no public handler imports the composition.

No real secret, network request, provider record, contact, invoice, email, payment, customer or suppression was used.

## Remaining blockers

This plan is not an execution authorization or an atomic snapshot. Before activation, the project still needs:

- reconciliation/retry for the request-store to contact-index dual-write gap;
- capture quiescence, locking or reconciliation while a multi-prefix plan is built and executed;
- deadlines for stalled provider reads/lists;
- revalidation by any future suppression executor;
- approved operator authorization, secret loading and key-retention policy;
- remaining privacy/legal and provider acceptance gates.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Prepare a disconnected, bounded reconciliation primitive for stored requests whose contact membership is missing. Use synthetic records only, add deadlines before any activation work, and keep capture unavailable.
