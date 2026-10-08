# Hosted failure diagnosis and deadline cause correction — 2026-10-07

## Completed
Read current GitHub workboard, latest native follow-up report, open PRs, current PR #8 code and PR #7 function/controller/tests. Starting main was bb50937bcd4899484acf4c20c4c976a3dbbc2600; PR #7 was aff6d4e3ac353e6b707c1e585ed66432cd7f215d and PR #8 was draft at 455ab58e048dace466538a90773fea0bbc81c739. Continued the existing PR #7 branch; no competing feature or account was created.

Authenticated Netlify deploy details are accessible. Expanded the Building log for [failed deploy 6ac69c984b90cc0008629da6](https://app.netlify.com/projects/cobro-agent-rodrigo/deploys/6ac69c984b90cc0008629da6), product commit 5ca876a086b864978b4d50c0d271955240ce7ff6. The provider log shows **203 tests, 202 passed, one failed**: deadline aborts hanging transport and late saved response is ignored, tests/pilot-interest-controller.test.cjs:181; assertion at line 184 received request_interrupted instead of request_timeout. The test command failed before the static build/deploy stages. This resolves the previously unknown failure cause; the later same-code green build was not a fix.

## Correction
[Product commit 3afcd545ef044454d7ab5163c8bd37134c023ffb](https://github.com/RodrigoCalleia/cobro-agent/commit/3afcd545ef044454d7ab5163c8bd37134c023ffb) in [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) changes only client/pilot-interest-controller.js and its tests.

The timer could fire just before performance.now reached the calculated deadline. It resolved request_timeout and aborted, but the final guard then classified the still-before-deadline abort as request_interrupted. A per-attempt timeoutTriggered flag now preserves the timer cause before resolve/abort; a single final deadlineExpired value also retains the monotonic guard against delayed response/getter confirmation. External cancel/edit/reset/dispose still invalidate revision/active before synchronous abort callbacks; stale timers cannot replace the new state. No timeout budget was extended. Timer expiry can remain conservatively a fraction early; this fix preserves its cause, not nanosecond scheduling precision.

A deterministic regression starts clock at 0, sets timeout 15, advances clock to 14.5 and explicitly fires the timer. It verifies request_timeout, aborted transport, timer cleanup and rejection of a later saved-confirmed response. It reproduced the original mismatch and passes with the correction.

## Verification
- Engineering: 25/25 targeted controller tests passed; before/after deterministic reproduction performed.
- Independent reviewer: reproduced the original mismatch in a VM using the GitHub source, reviewed the patch and ran **5/5 focused tests** covering early timer, cancel/retry, obsolete edit completion, reentrant result getters and monotonic expiration. No browser/provider/full-suite result attributed to this reviewer.
- Coordinator: 26/26 controller plus synthetic composition tests passed; fresh GitHub branch code materialized for final **204/204 local tests** and static build under Node 24.19.0. Initial offline dependency installation lacked a cached package; reused the existing installed SDK dependency cache instead. Runtime checks verified pinned SDK 11.1.1. No new SDK/provider acceptance is claimed.
- GitHub compare confirms exactly the two intended files changed (runtime 7 additions/3 deletions; regression 34 additions). The function, configuration, SDK lockfile, server helpers and two published demo assets remain unchanged in the product commit.
- Exact product commit Netlify deploy-preview status is **successful**, pointing to https://deploy-preview-7--cobro-agent-rodrigo.netlify.app . New hosted test logs were not independently inspected. This is build evidence, not authenticated handler/provider acceptance.
- Independent source audit of PR #8's focus correction found no blocking defect. It used current GitHub code/diff/report; did not personally repeat native browser checks or the 77-test suite. Mobile acceptance remains pending, so PR #8 stays draft/unmerged.

## Remaining acceptance
Attempted one authenticated browser navigation to PR #7's disabled function. Follow-on observation was rejected by the browser URL/protocol policy. No actual response body or HTTP status was verified; no workaround or alternate execution path was used, and this was not classified as a provider bot block. Hosted GET/POST 503 acceptance remains pending and PR #7 remains unmerged. Do not repeat this blocked browser action absent a permitted capability/policy change.

Capture is still disabled. Responsible-party/public privacy-contact facts and approved notice/display binding remain missing; runtime secrets/versioning, native rate acceptance, retention/deletion/operator access and actual synthetic provider write/read/delete are separate activation gates. Native mobile demo acceptance also needs a supported verification surface. No private record, contact form, delivery, billing, customer or live AI model was activated.

## Next and accounting
Use a permitted authenticated verification method for the unavailable handler and complete PR #8 mobile acceptance before integration. Prioritize resolving those existing gates over adding unused capture helpers. Recorded spend USD 0; recorded revenue USD 0; no outbound messages, real invoices, financial transactions, subscription changes or new accounts.
