# Capture composition and Pago TIC review — 2026-10-07

## Completed
Continued [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its existing isolated branch, from head `2ef7576dc1366e08b0f364aa83418cd68917798d` and main `137beb64e16bcc35fff8ed82061fc223f4972380`. Refreshed source using connected GitHub and verified 32 blob hashes. No concurrent product PR or account was created.

[Product commit 8643e79f2795c14a21ecdc8de408d1c873e504bc](https://github.com/RodrigoCalleia/cobro-agent/commit/8643e79f2795c14a21ecdc8de408d1c873e504bc) adds an unused server-only capture processor: native origin/method preflight, explicit declared notice-version check, HMAC retry identity, bounded body validation, per-request trusted metadata, lazy injected storage and exact private-confirmation mapping. Rejected input never reaches metadata/storage. Public JSON exposes no contact fields, token, record ID or provider details.

The notice header is a stale-page guard, not proof of approved/rendered text or consent. The future runtime must retain the trusted Netlify Context/current-published-deploy guard in its storage callback. There is no SDK import or live adapter in this processor. [Composition guide](../CAPTURE_PROCESSOR.md) records statuses, five-second shared initialization/create budget, cancellation and deployment limits.

## Verification
- Engineering: 23 targeted tests passed after fixes. Coordinator: final 178/178 full tests and static build passed under Node 24.19.0.
- Independent QA reproduced a defect where provider-result inspection could abort or expire after the first guard yet still confirm success. Engineering snapshots classification and rechecks abort/deadline immediately before definitive output; three independent post-fix probes passed, including a synchronous 5,050ms block. Five earlier independent probes checked shared deadlines and malformed outputs. No unresolved blocking defect for unused preparation; QA did not rerun the full suite.
- Injected in-memory adapter tests cover conditional create + strong read, unchanged-token retry preserving one record/original time, changed payload/notice conflicts, failures, concurrent tokens and initialization timeouts preventing late create. No real provider record was written.
- All existing product blobs, public disabled handler, netlify.toml, dependencies and demo source assets are unchanged. Static output contains the same two byte-identical assets. Handler still returns unconditional 503 and does not import this processor.
- GitHub Netlify deploy-preview status for exact product commit `8643e79f2795c14a21ecdc8de408d1c873e504bc` is successful: https://deploy-preview-7--cobro-agent-rodrigo.netlify.app . Hosted logs, processor/handler execution and private provider acceptance are not inferred.

## Requested payment research
Completed [Pago TIC evaluation](../PAGOTIC_REVIEW.md) from public official sources checked 2026-10-07, reviewed independently. Decision: candidate for our own one-off pilot payment, conditional on verified eligibility and commercial terms. No provider selected or payment implementation started. Its overlapping capabilities require testing Rondacobro's distinct value.

Unresolved: applicable transaction costs, settlement/withdrawal times, seller eligibility, credentials, refund/chargeback conditions and actual currency support. Preserve the current no-outreach/no-spend restriction: no commercial contact, account, credential use, API transaction or subscription. The guide includes primary links and separates advertised capabilities from conditions and architectural inferences.

## Blocker and next action
PR #7 remains open pending authenticated hosted 503 verification; unchanged team protection was not re-probed or weakened. Privacy/responsible-party/public-contact facts, approved notice/display proof, secret provisioning, native rate enforcement, browser integration, retention/deletion/private access and real synthetic provider readback/deletion remain activation gates.

Next useful task while access is unchanged: prepare the browser submission/retry/error-state controller in isolation with synthetic transport, keeping contact inputs absent from the public demo. Its contract must preserve one token for unchanged retries, stop on notice changes, distinguish202 unverified from200 confirmed and avoid automatic retry loops. Integrate only after capture gates pass. Payment decision stays pending current commercial conditions; do not open a checkout or claim clients.

## Accounting
Verified recorded spend USD 0; verified recorded revenue USD 0. No customers, payments, private contacts, real invoices, external messages, subscriptions or expense records created.
