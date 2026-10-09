# Single-ID repair primitive — 2026-10-09

## Result

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch. Added a disconnected, single-request repair primitive for the stored-request/contact-index dual-write gap.

- Re-reads the exact request and accepts only an active record with a valid contact; suppressed, malformed or unavailable records fail closed.
- Revalidates the request/contact binding immediately before any possible write.
- Uses the contact index's create-only membership operation, so repeated or concurrent repairs do not replace an existing membership.
- Confirms the membership with a strong read, then revalidates the binding again immediately before returning `indexed-confirmed`.
- A suppression race before or during confirmation returns only `suppressed`; provider or shape uncertainty returns only `unverified`.
- The result is opaque and contains no contact, token, request data or provider metadata.
- The runtime shares one abortable deadline across SDK loading, reads, the conditional write and confirmation reads. It remains disconnected from the public function, scheduler and browser.

## Independent review

An independent read-only audit confirmed exact binding checks, retained-version membership lookup, create-only idempotency, opaque output, bounded deadline handling and no public import. It identified a final suppression window between membership confirmation and return; this revision closes it with one last binding read.

## Verification

- New repair cases: **5/5 passed** (three pure-composition cases and two runtime/deadline cases).
- Complete Node suite: **258/258 passed**, zero failures.
- Static build passed and produced exactly `index.html` and `cobro-engine.js`.
- Import inspection found the repair code only in private server modules and tests; `netlify/`, the demo page and browser engine do not import it.
- Tests use synthetic IDs, contact values, secrets and in-process transports only. No provider write, customer contact or real lead was created.

## Limits and blockers

The two stores are not atomic. A suppression or provider failure after the final read can still race with a later event; callers must treat the result as a bounded confirmation and retry `unverified`. Operator authentication, secret loading/rotation, approved notice/responsible party/contact channel, retention/deletion controls, provider acceptance and hosted private acceptance remain required before any executor is callable. Capture remains unconditionally unavailable.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Keep the repair primitive disconnected. Define the operator-authorization and audit-log contract, then seek the remaining permitted private acceptance evidence. Do not schedule repairs, enable capture, contact prospects or use real data.
