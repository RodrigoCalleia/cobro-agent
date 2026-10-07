# Browser capture lifecycle — 2026-10-07

## Completed
Continued [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) from branch head `e6ceaa5fe135250bf9c36b60e2b887e5d744c9f6` and main `33f9da4f47257dc2fb5020db837ee526e48d1d27`. Refreshed the workboard, latest report, open PR/branches and 33 exact source blobs using connected GitHub. No concurrent product task or competing PR was started.

[Product commit 5ca876a086b864978b4d50c0d271955240ce7ff6](https://github.com/RodrigoCalleia/cobro-agent/commit/5ca876a086b864978b4d50c0d271955240ce7ff6) adds an unused browser-compatible controller with injected transport. It preserves the canonical retry token for unchanged manual retries, assigns a new identity after edits, suppresses double submission, invalidates obsolete responses and distinguishes exact confirmed 200 from unverified 202. A notice mismatch locks submission until explicit notice replacement and a fresh affirmative decision. No automatic retries, default fetch, DOM inputs, browser storage or logging are added.

The [browser lifecycle guide](../BROWSER_CAPTURE.md) documents the API, response/transport contract and limits. Same-notice drafts contain an explicit permission snapshot; future UI must bind that snapshot to the approved visible notice and actual user action. An injected parsed success object is not provider evidence. Reload/reset/new controller loses retry continuity; different tokens are not unique-business deduplication.

## Verification
- Engineering targeted controller suite: 24/24 passed under Node 24.19.0. Coordinator final full suite: 203/203 passed; static build passed.
- Independent QA found a reentrant token-factory failure could replace submitting state with failed while a nested request remained active. Fixed with an active-attempt guard and regression. Independent post-fix reproduction passed, along with response-getter cancellation/reset/notice/disposal, malformed status/schema, manual retry, stale response, token-change, notice and monotonic deadline probes. QA did not repeat the full suite.
- One persisted injected integration test exercises controller → server processor → in-memory adapter: a lost response after storage confirms only on unchanged retry and preserves one original record/time; changed payload starts another identity; notice mismatch requires replacement plus a fresh decision. These are synthetic test records, not actual leads/provider writes.
- Classic-script VM smoke verifies the factory without module/require. No real DOM, native fetch, mobile layout, live function, customer permission or provider operation is claimed.
- All 33 existing snapshot blobs and every pre-existing branch blob remain unchanged. Static output contains only the same two byte-identical demo assets. Public handler stays unconditional 503; product code is unmerged.

## New hosted blocker
GitHub reports **failed** Netlify deploy-preview status for exact product commit `5ca876a086b864978b4d50c0d271955240ce7ff6`, deploy `6ac69c984b90cc0008629da6` ([deploy details](https://app.netlify.com/projects/cobro-agent-rodrigo/deploys/6ac69c984b90cc0008629da6)). Redirect/Header/Pages checks also report failure and refer to the logs without diagnostics.

The new failure justified one focused read of this deploy's dashboard. This browser exposes Log in and no build logs. No login, protection bypass, security change or speculative fix was performed. Failure cause remains unknown: local 203/203 and build success are not hosted-build acceptance. Preserve the failing evidence; do not claim green CI or merge PR #7.

## Direction and next action
Retain the small-agency/consultancy invoice-follow-up hypothesis after the requested Pago TIC comparison. Its advertised payment/reconciliation/mora overlap means generic collection automation is not a demonstrated differentiator. Validate the review/context/pause workflow and proposed price; do not claim unique AI capability, clients or demand. Pago TIC remains a candidate, not a selected provider.

Next priority is authenticated access to the exact failed deploy logs, then an evidence-based correction and successful hosted build. The earlier authenticated hosted 503 requirement also remains. Before public capture: approved responsible party/public contact/privacy notice/display binding, secret provisioning, rate controls, retention/deletion/operator access and actual synthetic private write/read/delete. Prioritize these gates before adding more capture helpers. The published fictional-data demo is unchanged.

## Accounting
Recorded spend USD 0; recorded revenue USD 0. No money spent, subscription/account activated, outreach sent, real invoice used, live contact captured, customer or payment created.
