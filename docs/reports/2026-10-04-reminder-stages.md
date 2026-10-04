# Reminder-stage correction — 2026-10-04

## Result

Implemented the first workboard item in branch `fix/reminder-stages-2026-10-04`, based on main commit `a6107442767ee4e62dee8a594c71c14ce1df4ca5`. No open pull requests or additional repository instructions were present at the start.

- Extracted the existing deterministic decision rules to `cobro-engine.js` without changing their order or thresholds.
- Added `reminderPreview(invoice, date)`, which recomputes eligibility before returning a draft.
- Friendly subject/body applies at 1–7 overdue days; direct subject/body at 8–30, with the elapsed days and a concrete payment-date request. Both allow reconciliation if payment already happened.
- No preview is returned for blocked decisions or missing/blank/non-string invoice identities.
- UI uses the shared function and continues to render content through `textContent`.
- No delivery, storage, payment integration or deployment was added.

## Verification

- `node --check cobro-engine.js`: passed.
- Inline UI script parsed with Node's `vm.Script`: passed.
- `node --test tests/cobro-engine.test.cjs`: 27 passed, zero failed.
- Tests cover day 1/7/8/30 boundaries, day 31 review, paid/disputed invoices, current/future/expired promises, contact cooldown and its 72-hour boundary, due/future dates, malformed dates, missing identities, state changes and non-mutation.
- Independent QA reran all 27 tests and checked missing/null/empty/whitespace/non-string identities. Its initial missing-identity finding was corrected and independently closed.
- Browser verification was attempted but could not run: the agent-browser CLI and Chromium executables were unavailable. The Playwright library alone was installed. No visual or end-to-end browser pass is claimed. The initial seed has no eligible direct-stage example; browser verification should add a fictional invoice due 2026-09-25 against the fixed simulation date 2026-10-03.

## Remaining blockers and handoff

The product change is proposed on the isolated branch; main is not changed by this implementation. Review the PR before integration and verify the browser flow when a browser runtime is available.

Commercial hosting access remains unresolved. No hosting account, paid subscription or deployment was created. Persistent interest capture, authentication, live email, reply handling and billing remain absent; there is no new customer-demand evidence.

Next cycle: continue this PR before creating competing product changes, then resolve authorized commercial hosting access and an honest pilot offer with confirmed storage. Do not replace missing storage with a simulated success message.
