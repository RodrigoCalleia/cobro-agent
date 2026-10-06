# Private interest-storage preparation — 2026-10-06

## Result

Prepared server/pilot-interest-store.cjs on isolated branch product/private-interest-store-2026-10-06 from main 41707fefeff0e47f6080390e3e509731f6587ed8. The change implements conditional create-only writes, matching strong-read confirmation, same-ID retry protection and verified-delete semantics against an injected provider API. Test and production use distinct fixed store names; preview/unknown contexts fail before opening storage. No arbitrary email/contact value is used in keys.

[Storage integration](../INTEREST_STORAGE.md) records the selected Netlify Blobs path and required server integration. Provider documentation was checked on 2026-10-06. The authenticated project's Blobs page showed an empty-state introduction. No store or provider record was created, read or deleted.

## Verification

56 local Node tests passed (44 existing plus 12 storage tests). Node syntax and static build passed. Existing local source/test blobs matched fresh GitHub main before verification. Static publication still contains only unchanged index.html and cobro-engine.js.

Tests use an in-memory fake provider and fictional example.test data. They check strong-read options, create-if-new options, concurrent same-ID attempts, changed-record conflicts, ambiguous writes, failure states, invalid IDs/records, separate namespaces and deletion confirmation. They do not prove SDK/service behavior, live persistence or global exactly-once delivery.

## Remaining gates

No SDK was installed, capture endpoint deployed, form exposed, notification sent or new subscription activated. No real customer/contact/invoice data was used. No new spending or revenue is established by this work.

Next: connect a pinned official SDK in a disabled-by-default trusted server route, complete the notice/responsible-party/public-contact requirements, and exercise private synthetic write/read/delete before activating capture. Same-ID retries are covered; deduplication across new IDs, trusted metadata generation, notice binding, abuse controls, retention and authenticated operator routes remain pending. Separate anonymous-session and mobile checks remain pending.

## Independent review

Task-scoped QA executed all 12 storage tests plus additional cases and found no blocking defect in the prepared adapter. Independent infrastructure review confirmed the API contract and identified the documentation's concurrency wording contradiction; the integration guide now limits the claim to conditional operations on one key. Both reviews emphasize that production isolation must be derived from a trusted runtime and that fake-provider tests do not verify Netlify persistence.

## Hosted build review and recovery

PR #5 merged at `ee8f563c6797757d34a0fb24a8ff7190e98be7d1`. The initial Netlify preview checks reported failure; this state was inspected after merge. This was a review-order mistake: future integration must read hosted check status before merging, even when local tests pass.

Actual preview `6ac519f6d293ba0007b737c9` passed all 56 tests, then failed because dist contained an unexpected netlify.toml. The file's origin was not established from that log; strict output checks were left intact. The dashboard's Retry without cache action produced successful preview `6ac51a9b13dca981d3e54700` at 12:58 local. Its real build log recorded 56 passes, zero failures and two demo assets built. Netlify's final deploy browser also lists a 103-byte netlify.toml config artifact, beyond the two files produced by our script. No source/build configuration was changed for recovery.

Successful preview details: https://app.netlify.com/projects/cobro-agent-rodrigo/deploys/6ac51a9b13dca981d3e54700

A proof screenshot was retained for the owner. Cached-build recurrence is not tested; this remains an explicit deployment prerequisite. Production stayed at e204d8d, and neither the preview nor this module activates contact storage. Recording commits use [skip netlify]; the real preview evidence above is distinct from those skipped pushes.
