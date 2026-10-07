# Bounded request-reader cycle — 2026-10-07

## Source and decision

Read main WORKBOARD.md at a092d92edb61f4f9757b9a17eeb819a3f629435e, open PR #7 at d45e253ce2d7dcf00b662ab5122f321440915792, current validation/runtime/disabled-handler code, the preceding storage-deadline report and continuity instructions. Continue product/disabled-interest-route-2026-10-06; no competing product PR or other repository is touched.

Authenticated preview handler verification remains a recorded access blocker. There was no new access evidence to justify repeating that login probe. Choose the pending bounded-body parsing prerequisite as useful independent work behind the unchanged disabled handler.

## Delivered

Added an unused server-only request reader with a fixed 4096-byte actual stream cap, POST/JSON/UTF-8 envelope checks, declared-length early rejection and final matching, fatal incremental decoding and strict existing field validation. A separate invocation budget (two seconds by default, configurable by trusted server code up to five seconds) interrupts stalled reads/aborts and prevents late acceptance using monotonic checks. Cleanup cancels/releases without waiting for stalled cancellation. Errors expose codes/field names, never submitted values or raw stream details. No SDK/storage/provider access is opened by the helper.

The helper is not imported by the public function. No form, contact record, metadata/notice activation, public inspection/deletion, external email or billing is added. The continued branch work rejects repeated decoded JSON keys at every object depth, including escaped-equivalent spellings; comparison does not apply Unicode normalization. This is an application-consumption cap/read budget, not proof of total HTTP/ingress/rate protection or logical-request deduplication.

## Verification

26 targeted reader tests passed. Full local suite: 114/114 passed, zero failed, under Node 24.19.0. Static build passed and both demo output files match source bytes. Existing demo assets, Netlify config, disabled function, SDK/storage modules and original validator are unchanged. No live service request or stored contact was used; synthetic Request/Web Streams exercise failures, lengths/bytes, UTF-8 fragmentation, cancellation and concurrent invocation behavior.

Task-scoped independent QA reviews the code and reruns appropriate tests; its final findings and exact hosted status are recorded in the closing update. Hosted parser execution and private write/read/delete are not claimed from these local results or a preview build status.

## Accounting and next coordinator decision

No spending or subscriptions, messages to third parties, real invoices or new account/service were used. Last recorded experiment totals remain USD 0 expenses and USD 0 revenue. No customer, demand or payment metric is inferred from test fixtures.

Keep PR #7 open until authenticated hosted unavailable-handler verification is available. Next bounded work behind disabled capture: trusted notice/metadata boundary design, with submission deduplication, rate/retry/retention and privacy/contact gates still pending. A separate commercial-validation preparation task may proceed from docs/PILOT.md without external outreach or claiming an available paid service.

PR: https://github.com/RodrigoCalleia/cobro-agent/pull/7

## Independent QA closing

The task-scoped reviewer independently reran all 114 tests with exit 0, including 26 reader cases and the unchanged disabled-handler/runtime tests. Additional adversarial checks covered decoded Unicode escapes, quotes/backslashes, arrays and nested scopes, strings containing JSON-like text, 2000-level nesting within the byte cap, exact 4096-byte duplicate rejection and 4097-byte overflow. No functional blocker was found for the unused internal-helper scope. It confirmed the documented limits: default two-second budget with a trusted override up to five seconds, exact decoded-key comparison without Unicode normalization, and no guarantee for upstream buffering, submission deduplication or the entire HTTP pipeline.

## Hosted and repository closing evidence

Exact tested product commit: a6e3e30d4bcebc4c0ca95e60e3cbfaae29ac1ccc. Netlify deploy-preview status is successful for this commit, deploy 6ac5b8a22678c20008d4530e: https://app.netlify.com/projects/cobro-agent-rodrigo/deploys/6ac5b8a22678c20008d4530e . Redirect/Header/Pages checks completed neutral. Hosted test-log count, HTTP handler/body execution and provider persistence remain unverified; preview build success does not satisfy those acceptance checks.

Verified the repository tree: reader/test/guide/pilot/report/workboard are the six intended task paths; the branch also includes three byte-identical main-only brand/cadence documents to preserve the workboard's links. Existing public function, validator, SDK/storage/deadline modules, demo source assets and Netlify config match the preceding PR tree exactly. GitHub reported a documentation merge conflict with main after the earlier report/brand/cadence updates. The closing merge synchronizes main ancestry into the isolated PR branch using the reviewed union tree and expected-head checks; it does not merge product code into main or change tested product blobs. Report/workboard are mirrored to main for durable coordination. PR #7 remains open pending authenticated hosted-handler verification.


## Duplicate-key closure continuation

Re-read main at `11f3deca430324114edb0046080740c3629dd4b4`, open PR #7 at `1003428aa282fb05c43cf8d344e8c0979112ac8f`, this report and the current branch code before changing the existing isolated branch. Added a syntax-after-parse scanner that keeps an independent key set per object and fails with `duplicate_keys` before field validation. The public handler remains unconditional 503 and does not import the reader, read input or open storage.

Two new regression tests cover repeated permission/contact/business keys, escaped-equivalent key spellings, nested duplicates and identical key names in separate objects. Local verification passed 26/26 reader tests, 114/114 full tests and the two-asset static build under Node 24.19.0. Independent QA reran the full suite and the adversarial cases summarized above. No hosted handler, parser or provider operation is inferred from local evidence; the new branch head requires its own hosted status inspection.

No spending, subscription, third-party message, real invoice, contact, customer, demand or revenue was created. Verified experiment totals remain USD 0 expenses and USD 0 revenue. The next useful prerequisite is trusted notice/version and server metadata binding; privacy contact/ownership, rate limits, logical-submission deduplication, retention/deletion and synthetic provider verification remain activation gates.
