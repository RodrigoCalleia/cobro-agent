# Bounded request-reader cycle — 2026-10-07

## Source and decision

Read main WORKBOARD.md at a092d92edb61f4f9757b9a17eeb819a3f629435e, open PR #7 at d45e253ce2d7dcf00b662ab5122f321440915792, current validation/runtime/disabled-handler code, the preceding storage-deadline report and continuity instructions. Continue product/disabled-interest-route-2026-10-06; no competing product PR or other repository is touched.

Authenticated preview handler verification remains a recorded access blocker. There was no new access evidence to justify repeating that login probe. Choose the pending bounded-body parsing prerequisite as useful independent work behind the unchanged disabled handler.

## Delivered

Added an unused server-only request reader with a fixed 4096-byte actual stream cap, POST/JSON/UTF-8 envelope checks, declared-length early rejection and final matching, fatal incremental decoding and strict existing field validation. A separate invocation budget (two seconds by default, configurable by trusted server code up to five seconds) interrupts stalled reads/aborts and prevents late acceptance using monotonic checks. Cleanup cancels/releases without waiting for stalled cancellation. Errors expose codes/field names, never submitted values or raw stream details. No SDK/storage/provider access is opened by the helper.

The helper is not imported by the public function. No form, contact record, metadata/notice activation, public inspection/deletion, external email or billing is added. Repeated JSON keys still have JSON.parse last-value semantics; strict ambiguity rejection is pending before activation. This is an application-consumption cap/read budget, not proof of total HTTP/ingress/rate protection.

## Verification

24 new targeted reader tests passed. Full local suite: 112/112 passed, zero failed, under Node 24.19.0. Static build passed and both demo output files match source bytes. Existing demo assets, Netlify config, disabled function, SDK/storage modules and original validator are unchanged. No live service request or stored contact was used; synthetic Request/Web Streams exercise failures, lengths/bytes, UTF-8 fragmentation, cancellation and concurrent invocation behavior.

Task-scoped independent QA reviews the code and reruns appropriate tests; its final findings and exact hosted status are recorded in the closing update. Hosted parser execution and private write/read/delete are not claimed from these local results or a preview build status.

## Accounting and next coordinator decision

No spending or subscriptions, messages to third parties, real invoices or new account/service were used. Last recorded experiment totals remain USD 0 expenses and USD 0 revenue. No customer, demand or payment metric is inferred from test fixtures.

Keep PR #7 open until authenticated hosted unavailable-handler verification is available. Next bounded work behind disabled capture: strict duplicate-key handling and trusted notice/metadata boundary design, with rate/retry/retention and privacy/contact gates still pending. A separate commercial-validation preparation task may proceed from docs/PILOT.md without external outreach or claiming an available paid service.

PR: https://github.com/RodrigoCalleia/cobro-agent/pull/7

## Independent QA closing

The task-scoped reviewer independently reran all 112 tests with exit 0, including 24 reader cases and the unchanged disabled-handler/runtime tests. Additional in-process checks verified abort listener restoration and stream-lock release after success, invalid JSON and timeout. No functional blocker was found for the unused internal-helper scope. It confirmed the documented limits: default two-second budget with a trusted override up to five seconds, JSON.parse duplicate-key last-value semantics, and no guarantee for upstream buffering or the entire HTTP pipeline.
