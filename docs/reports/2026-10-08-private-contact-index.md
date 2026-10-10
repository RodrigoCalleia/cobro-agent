# Private contact index preparation — 2026-10-08

## Outcome

Added a preparation-only private contact index module to the isolated PR #7 branch. It associates multiple opaque request IDs with a normalized contact through an injected server-side derivation, without putting the raw email in keys, returned values or logs. It is not imported by the public function and does not open Netlify storage.

## Implemented

- Strict contact normalization using Unicode NFKC, trimming and lowercase normalization.
- Validated UUID v4 request IDs only.
- Injected `deriveToken`, `read` and atomic `update(token, updater)` adapters; no provider/network dependency in the module.
- Idempotent association of an existing request ID.
- Bounded IDs per contact and fail-closed handling of malformed stored values.
- No raw contact value is returned after derivation; the result exposes only the opaque token and request IDs.
- A concurrent two-ID test exercises the required atomic update contract with a synchronous in-memory adapter.

The token function remains an activation prerequisite: production must use a keyed, versioned server-side derivation with secret rotation policy. The update function must provide real compare-and-swap/serialization semantics; the module cannot create that guarantee by itself.

## Verification

- New focused tests: **6/6** passed.
- Complete local suite: **216/216** passed after the change.
- Static build passed and produced exactly two demo assets.
- Independent audit found no remaining design blocker in preparation-only scope and explicitly flagged real-provider atomicity as unverified.
- No public handler, form, provider write/read/delete, lead, email, invoice, payment or customer activity was enabled.

## Limits and next gate

The module is intentionally not wired into capture. Before use, the project still needs a trusted derivation implementation, a provider-backed atomic index update, suppression and rectification across every associated request ID, retention/secret-rotation policy, operator access controls, provider acceptance, and the legal/privacy gates already documented in `docs/PRIVACY_READINESS.md`. The public handler remains unavailable.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Verify whether the selected provider can support the required atomic update or choose a safe serialization layer; then add synthetic composition tests for multi-ID suppression and rectification. Keep the route disabled and do not write real contact data.
