# Simulated invoice follow-up editing — 2026-10-07

## Completed
Read current GitHub main `9f849c089b4cb9d59d879ef6d67b75c1b9aa0ea6`, workboard, latest report, code and open PRs. PR #7 remains blocked on hosted capture/privacy acceptance; no new capture helper or unchanged login probe was attempted. Chose the independent demo workflow from the invoice-follow-up backlog.

[PR #8](https://github.com/RodrigoCalleia/cobro-agent/pull/8), isolated branch `product/demo-followup-actions-2026-10-07`, [product commit 10f4e7c584fe471f083973c1fc9a6cea8f3a4410](https://github.com/RodrigoCalleia/cobro-agent/commit/10f4e7c584fe471f083973c1fc9a6cea8f3a4410), adds **Simular seguimiento** to existing unpaid fictional invoices.

The dialog edits pending/disputed state, optional promise and last-contact dates, then recalculates the same invoice's decision/preview. Clearing dates can resume reminders; a current promise, dispute or contact under 72 hours pauses them. Identity, amount and due date stay unchanged. Paid invoices cannot be edited. Cancel, dialog cancel event and reset clear selection. Updates remain fixed-date/in-memory and explicitly send no message or money.

The immutable `applyDemoFollowup` validates its exact three primitive edit fields, real dates and future contact dates before applying paused/paid state. This is scoped follow-up validation; the existing `decision` and invoice-creation form retain their prior validation behavior. Dates have day-level precision against 2026-10-03, not real contact timestamps/history. README/PILOT describe this prepared branch and its limits.

## Verification
- Engineering: 12 new tests plus 27 existing engine tests passed. Coordinator: final **77/77 main-based branch tests**, syntax execution and static build passed under Node 24.19.0. The separate capture branch's 203-test suite was not repeated or replaced.
- Independent QA cleared transitions, exact 72-hour boundary, fixed fields/frozen inputs, 32 invalid-date combinations under paid/disputed states, future-contact rejection, paid guard, extra fields and accessor rejection. UI source uses safe text/value APIs and selected-object identity. QA did not execute a native browser or the full suite.
- Coordinator executed the real inline UI in an injected DOM simulation: dispute/promise/contact transitions, clearing, cancellation events, stale paid guard, reset and parsed JSON export passed. This does not verify native dialog timing, keyboard/focus behavior, HTML constraint validation, visual layout or mobile.
- HTML duplicate-ID/form/script structure checked. Build emits only index.html and cobro-engine.js, matching source bytes; configuration, storage modules and dependencies are unchanged.
- Exact product commit Netlify deploy-preview status is **successful**: https://deploy-preview-8--cobro-agent-rodrigo.netlify.app . This is build evidence, not hosted UI execution or independently verified test-log count.

## Acceptance and next action
A native remote-browser attempt to the local preview failed with ERR_CONNECTION_REFUSED; the local server was stopped. No browser/mobile visual pass is claimed. PR #8 stays draft/unmerged until native desktop/mobile verification of editing, cancel/Escape/focus, reset/payment/export and constrained inputs. Production still has the last verified fictional-data demo; this feature is not declared published.

Keep PR #7 separate and capture disabled; authenticated hosted503, privacy/contact/notice, secrets/rate/retention/operator access and actual provider readback/deletion remain its gates. Neither follow-up simulation nor green preview proves live autonomous collection, AI capability or demand. Next development/integration priority: validate this complete demo workflow in a reachable native preview before enlarging it, alongside resolving the existing activation gates.

## Accounting
Recorded spend USD 0; recorded revenue USD 0. No external messages, paid subscriptions, real invoices, private contacts, accounts, customers or payments created.
