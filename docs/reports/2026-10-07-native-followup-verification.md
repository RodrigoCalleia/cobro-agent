# Native desktop follow-up verification — 2026-10-07

## Completed
Read current main workboard, latest follow-up report and open PRs. Main was `e2268094b0c8298ea9fb2f15a3af1fe88b17e7f5`; PR #8 was draft at `d4740e49a2d95c105cd7f4cdca5527ae817a2b85`. PR #7 remains separate.

At the owner's explicit request, signed in to the existing Netlify account using GitHub and verified the cobro-agent-rodrigo project dashboard. Account creation, subscription changes and protection changes were unnecessary. The authenticated PR #8 preview now opens at https://deploy-preview-8--cobro-agent-rodrigo.netlify.app/ . This is current-session access evidence, not a guarantee that a future session remains authenticated.

## Native browser evidence
Executed the hosted preview in native desktop Chrome with fictional F-001, US$750 and due date 2026-10-01:
- A current promise paused the reminder; reopening preserved its value. Cancel discarded an attempted date removal and returned focus to the launching button.
- A contact dated 2026-10-04 was rejected by native input range validation against fixed today 2026-10-03; the dialog remained open. Contact 2026-10-02 paused the reminder.
- Marking a dispute paused the reminder; resolving it with no promise/contact restored the friendly preview. Invoice identity, amount and due date remained unchanged.
- Escape discarded an unsaved promise and returned focus to the launching button.
- Saving initially lost keyboard focus because rendering replaced the launching button. [Commit f5ee9700c7ada82f263f6de8e0f10ef1c7862530](https://github.com/RodrigoCalleia/cobro-agent/commit/f5ee9700c7ada82f263f6de8e0f10ef1c7862530) fixes this on the existing PR #8 branch: rendering can focus the new follow-up button belonging to the exact updated invoice object.
- After the exact correction commit's Netlify deploy-preview status became successful, reloaded the preview. Saving a promise and clearing it with contact 2026-09-30 (exactly 72 hours) returned focus to the same invoice's follow-up button; the latter restored its friendly reminder. Native activeElement checks confirmed both outcomes.
- Opened the resulting friendly draft and closed it; focus returned to its preview button. Simulated payment removed F-001's follow-up action. Downloaded and parsed JSON confirmed simulation=true, fixed date, amount/due unchanged, promise absent, contact 2026-09-30, paid=true and paid decision. Reset restored the seed decision, actions and pending total.

The correction changes only index.html on the isolated feature branch. Inline script syntax and static build passed locally. An initial verification command used a nonexistent build filename; rerunning the repository's actual scripts/build-static.cjs succeeded. The previously approved 77-test suite was not repeated for this focused DOM-only change; no new full-suite or independently inspected hosted test-log count is claimed. Green Netlify status is build evidence. No independent second reviewer participated in this bounded focus correction.

## Remaining acceptance
PR #8 remains draft/unmerged. Native mobile layout/touch checks are still pending; no mobile pass, stale-paid concurrent dialog test, full end-to-end autonomous operation or public feature publication is claimed. The available browser API did not advertise viewport/mobile emulation, and no unsupported browser-control path was attempted.

PR #7's authenticated GET/POST unavailable-handler acceptance remains unexecuted in this cycle. Capture is still disabled, with approved responsible party/public privacy contact/notice, secret provisioning, rate/retention/operator access and actual synthetic provider write/read/delete still outstanding. Authenticated project access is resolved for this session; it does not resolve these independent gates.

## Next step and accounting
Complete native mobile acceptance of PR #8, review current checks/head/main and integrate only after its gate passes. Use current Netlify access to verify PR #7 separately. Obtain approved responsible-party and public-contact facts before contact capture. Recorded spend USD 0; recorded revenue USD 0. No real invoices, customer records, outbound messages, money movement or live AI model were introduced.
