# Cobro Agent workboard

## Purpose

Validate an automated B2B invoice follow-up product for small agencies and consultancies. The owner observes and comments; the coordinating agent chooses and executes routine work within the granted access.

## Verified status — 2026-10-06

- Interactive prototype is stored in index.html.
- Fictional invoices, manual test-invoice entry, decision rules, reminder preview, simulated payment and JSON export exist.
- Runtime state is in memory and resets on reload. The simulation date is fixed and labelled.
- The Netlify production demo is public at https://cobro-agent-rodrigo.netlify.app/ after explicit owner approval. The deployed desktop flow is verified; mobile and a separate anonymous-session check remain pending. No persistent leads, product authentication, live email delivery, reply handling or billing are connected.
- Friendly (1–7 overdue days) and direct (8–30 days) decisions now generate different preview subjects and bodies. Blocked decisions do not produce a preview.
- No measured customer-demand or revenue evidence exists.
- The demo includes a pilot proposal labelled as an unvalidated, unavailable offer. Its CTA opens the existing simulation; there is no enrollment or contact capture.

## Latest integration — 2026-10-05

[PR #1 — stage-specific reminder previews](https://github.com/RodrigoCalleia/cobro-agent/pull/1) was merged into `main` at `3a659f41e213a06dd31d9263da18a12a2ae24ad3`.

- The merged product/test blobs match the previously tested PR head: 27 Node tests passed before integration, and independent QA re-executed all 27 test functions in V8 during integration review.
- GitHub had no hosted checks, statuses or reviews; do not describe this as CI-verified.
- The workboard-only commit that landed on `main` after the PR branch was created was preserved.
- Browser/mobile verification is still pending because no working browser runtime was available. No visual pass is claimed.
- [Integration report](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/reports/2026-10-05-integration-review.md) records evidence, limitations and handoff.
- Next coordinator action: verify the integrated browser flow, then resolve authorized commercial hosting and persistent pilot-interest capture. Keep external delivery, subscriptions and deployment blocked until their own prerequisites are verified.

## Hosting preparation — 2026-10-05

[PR #2](https://github.com/RodrigoCalleia/cobro-agent/pull/2) was merged at `a9e3ec24b21342f5ca8f46c33f0022bbd3ad5c14`. Netlify Free is selected as the initial commercial demo candidate; provider sources were rechecked on 2026-10-05.

- Main now has a dependency-free static build and Netlify configuration. Publication output contains only `index.html` and `cobro-engine.js`; tests/reports are excluded.
- 34 Node tests passed, including seven build checks. Independent QA reran them; actual output matched source bytes and TOML parsed.
- No product UI or reminder-rule change occurred. No hosting account, deployment or capture form was activated.
- Netlify/Cloudflare plugin discovery found no available integration. Authenticated, authorized hosting access and actual plan confirmation are the deployment blockers.
- Browser verification remains pending: Chromium and agent-browser were unavailable. Avoid repeating the same probe until runtime or hosting access changes.
- [Hosting preparation report](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/reports/2026-10-05-hosting-preparation.md) and [deployment guide](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/DEPLOYMENT.md) contain evidence and exact prerequisites.
- Next bounded work: define the pilot offer and minimal interest-capture contract while access is unresolved. Do not activate capture or show saved-success until a real test POST is found in provider storage. Once hosting access exists, deploy this prepared configuration and verify mobile/desktop flow.

## Pilot offer preparation — 2026-10-06

[PR #3](https://github.com/RodrigoCalleia/cobro-agent/pull/3) was merged at `69066b740390b44e2c4569034762b85ab5ee3c2a` after independent QA and unchanged-main checks. It adds a visible proposal and [pilot/capture contract](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/PILOT.md) from isolated branch `product/pilot-offer-2026-10-06`.

- Hypothesis: small B2B agencies/consultancies; 30-day pilot, one business, up to 50 outstanding invoices, US$29 total. No active offer, checkout or demand result is claimed.
- CTA links only to the fictional-data simulation. No contact collection, enrollment, reservation, delivery or payment was activated.
- 34 Node tests passed; static build, HTML structure/anchor, script syntax and publication-asset checks passed. Browser/mobile verification remains pending.
- Capture contract requires a trusted validation boundary, explicit contact permission and notice association, private storage, safe duplicate/error handling and a matching stored-record read before saved-success claims.
- [Cycle report](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/reports/2026-10-06-pilot-offer.md).
- That hosting-access blocker was resolved later in this session; see the public-deployment section below. Public visibility approval and publication are complete. Capture remains incomplete and must not be counted as demand.

## Public Netlify deployment — 2026-10-06

Netlify project `cobro-agent-rodrigo` was created on the authenticated Free plan after owner-approved GitHub authorization and app installation limited to cobro-agent.

- Deploy `6ac50050db1a952bf7e9bd8a` is published from `e204d8d82225c4bc39b5e9a4476fa6822c26995e`.
- Site: https://cobro-agent-rodrigo.netlify.app/ — public visibility explicitly approved by the owner and confirmed by Netlify. Reload displayed the expected demo heading.
- Actual Netlify build log: 34 tests passed, zero failed, two demo assets built. Dashboard reported currently published.
- Deployed desktop checks passed for friendly/direct preview, fictional invoice creation, simulated payment, dispute suppression, reset and parsed JSON export. Mobile and anonymous-access checks remain pending.
- The initial public-action approval block was resolved by explicit owner approval. “Make public” succeeded; Netlify displayed “Your project is public” and “Anyone can visit your production site.”
- [Deployment report](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/reports/2026-10-06-netlify-private-deployment.md).
- Next action: complete mobile and separate anonymous-session checks, then implement persistent pilot-interest capture against docs/PILOT.md. Hosting access, Free plan confirmation and public visibility are resolved. Contact capture, real invoice operation, email and billing remain unfinished.

## Pilot-interest validation foundation — 2026-10-06

[PR #4](https://github.com/RodrigoCalleia/cobro-agent/pull/4) was merged at `4b492e5c3c7ab893606228f9deee0762d0dc1d26` from isolated branch `product/pilot-interest-validation-2026-10-06`.

- Implemented strict request validation for the three permitted capture fields, including affirmative boolean permission, syntax/length/type checks, control/newline rejection and an extra-field allowlist.
- 44 local Node tests passed (34 existing, 10 capture tests), syntax and static-build checks passed. The published demo assets are unchanged; no hosted-test or mobile pass is claimed for this step.
- Independent QA found acceptance of Unicode line/paragraph separators; the fix and regression cases passed, and QA rechecked the four affected cases.
- This module is preparation only: there is no deployed capture endpoint, input form, stored lead, automatic email or saved-success UI. It does not activate Netlify Forms.
- Current capture blockers: private storage and its inspection/deletion path, responsible party/contact channel and approved notice. Server metadata, notice binding, body-size/rate controls, retry/duplicate handling and storage-confirmation checks still require implementation.
- [Cycle report](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/reports/2026-10-06-interest-validation.md).
- Next bounded work: verify a private storage path and choose the smallest server integration; complete the capture activation gates before exposing inputs. Mobile and separate anonymous-session verification remain pending.

## Private storage preparation — 2026-10-06

[PR #5](https://github.com/RodrigoCalleia/cobro-agent/pull/5) was merged at `ee8f563c6797757d34a0fb24a8ff7190e98be7d1` from isolated branch `product/private-interest-store-2026-10-06`.

- Netlify Blobs selected as the minimum candidate within the existing account. Authenticated Blobs UI is accessible and empty; no private provider record was created.
- Prepared a server-only injected storage adapter: fixed separate test/production names, preview rejection, conditional create-only writes, same-ID retry protection, exact strong-read confirmation and confirmed deletion.
- 56 local tests passed. Independent QA reran 12 storage tests; infrastructure review checked current official API documentation and its concurrency wording limitation.
- Initial preview `6ac519f6d293ba0007b737c9` passed all 56 tests but build failed on unexpected `dist/netlify.toml`. GitHub preview checks reported failure. This hosted state was inspected after merge; future cycles must inspect hosted checks before merging.
- Retried preview without cache: `6ac51a9b13dca981d3e54700` succeeded at 12:58 local with 56 passing tests and two demo assets produced. Netlify's deploy browser includes an additional 103-byte netlify.toml provider/config artifact. No unknown-output or symlink guard was weakened.
- Cached-build recurrence is not tested. Before the next product deployment, confirm cached rebuild behavior or retain the documented clean-cache recovery; do not label the initial failing preview successful.
- No SDK, capture endpoint/form, live storage, notice activation or customer data was connected. Product demo assets are unchanged; production remains the previously published demo.
- [Cycle report](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/reports/2026-10-06-private-storage-preparation.md) and [storage integration](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/INTEREST_STORAGE.md).
- Next: verify cached build behavior, integrate the pinned SDK from a disabled trusted route, complete notice/responsible-party/public-contact gates, then perform synthetic private write/read/delete. Mobile and separate anonymous-session checks remain pending.

## Cached-build repair — 2026-10-06

[PR #6](https://github.com/RodrigoCalleia/cobro-agent/pull/6) was merged at `b68bd7ce44b0adcc39353881cc0c3389a92e063e` from isolated branch `fix/netlify-cached-config-2026-10-06`.

- Builder accepts only an existing regular dist/netlify.toml identical byte-for-byte to the regular repository config; the copy is preserved. Unknown entries, changed copies and symlinks still stop before asset writes.
- All 65 local tests passed; independent QA reran all 65 without a blocking defect. Clean output contains two byte-identical demo assets. Product UI and source assets are unchanged.
- Actual GitHub Netlify preview status was successful before merging; Redirect/Header/Pages checks completed neutral. Preview deploy `6ac571697e7cd40008e93b64`: https://deploy-preview-6--cobro-agent-rodrigo.netlify.app .
- Explicit cache restore/retry and hosted test count remain unverified: this browser session presents Log in and no usable deploy logs. Do not equate the green preview with verified restored-cache reproduction.
- Post-merge production confirmation remains pending. The previous public deploy is the last verified production state; capture is still disabled.
- [Cycle report](reports/2026-10-06-cached-build-fix.md).
- Next: verify cached rebuild when authenticated deploy access is available; meanwhile pin the SDK and prepare a disabled trusted route. Complete notice/responsible-party/public-contact gates before exposing capture or performing synthetic private storage checks.

## SDK and disabled route preparation — 2026-10-06

[PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) is open from isolated branch `product/disabled-interest-route-2026-10-06`, product commit `475f69de8b888adc2d4fcc03f2bb1a3ffff7dc9f`.

- Pinned official @netlify/blobs 11.1.1 with lockfile and Node 24.x. Added a lazy server-only SDK connection gated by trusted Context for this project's current published production deploy.
- The new function entry always returns 503/unavailable, without reading requests/context, importing SDK, opening storage or logging contacts. No form or activation env flag was added.
- Guarded unexpected conditional PUT responses before SDK false success. All 77 local tests passed, including 12 installed-SDK/runtime cases; independent QA reran all 77 successfully.
- Netlify deploy-preview build status was successful for the product commit before review. Deploy `6ac58e96e0440600085f0cae` has completed neutral Redirect/Header/Pages checks.
- HTTP preview GET returned 401/Login Redirect before reaching the function. Hosted 503 execution and POST remain unverified. Keep PR open and preserve access protection until authorized authenticated handler verification is available. This change has not advanced production.
- SDK tests use an in-process transport, not private provider storage. No contacts, real invoices, email, billing or demand evidence was activated. Demo assets and netlify.toml are unchanged.
- [Cycle report](reports/2026-10-06-disabled-interest-route.md).
- Next coordinator action: continue PR #7 and verify its unavailable handler, then inspect checks/source/main before integration. Behind the disabled route still need deadlines, bounded parsing, trusted metadata/notice, abuse/retry/retention and privacy/contact gates before synthetic private storage verification.

## Storage operation deadlines — 2026-10-06

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its existing isolated branch; no competing product PR was started.

- Added a five-second budget per private create/read/delete invocation, including response bodies and confirming strong reads. Separate controllers/adapters isolate simultaneous calls; monotonic checks and a caller timer prevent late confirmations and further transport after expiration.
- Expired create/delete remain unverified; private read expiry throws instead of claiming absence. Cancellation cannot prove rollback of an already dispatched provider request. SDK retry sleeps may outlive a call but cannot issue further transport through its closed budget.
- The disabled public function, demo source assets, netlify.toml and original injected storage adapter remain unchanged. No storage record, contact form, delivery, billing or customer evidence is activated.
- Eleven new installed-SDK regression cases bring the local suite to 88; static build passed and independent QA reran all 88 without remaining blockers. Hosted verification results are recorded in the cycle report.
- Netlify preview status is successful for deadline product commit `b2e0327a7a103105a845696d5b2e96dca385b749` (deploy `6ac5ae415501cb0008c94d92`). Hosted test-log count is not independently verified. The preview function redirects to team protection requiring an invited Netlify login. No authenticated handler verification is available in this cycle. Keep PR #7 open; no hosted 503 execution or provider write/read/delete success is claimed.
- [Cycle report](reports/2026-10-06-storage-deadline.md).
- Next: verify the unavailable handler with authenticated project access, inspect checks/source/main and integrate PR #7 when its acceptance requirement passes. Continue privacy/contact and parsing/rate/notice/retry/retention prerequisites before enabling capture.

## Working roles

- Coordinator: select the next useful task, integrate bounded work, check evidence and report.
- Engineering: implement a small task in isolation.
- QA: independently check behavior, edge cases and claims.
- Market/infrastructure research: resolve a named uncertainty from current primary sources; do not invent customer evidence.

Subagents are task-scoped, not continuously running. Use only available capabilities and avoid parallel writes to the same path. One scheduled coordinator owns each work cycle.

## Ordered backlog

1. Completed 2026-10-05: reminder preview text now matches friendly/direct stages and has targeted checks. Delivery remains separate and unimplemented.
2. Hosting published 2026-10-06: Netlify Free plan confirmed, production deploy verified and public visibility explicitly approved/completed; no paid subscription activated.
3. Offer defined 2026-10-06 as a visible, unavailable hypothesis; docs/PILOT.md specifies scope and capture gates. Request-validation foundation (PR #4) and tested storage adapter preparation (PR #5) are merged; no capture endpoint or live storage is active. Persistent interest capture remains incomplete. Connect trusted validation/private storage; enable saved-success only after confirmed storage. Do not expose customer data in this public repository.
4. Public deployment and desktop flow verified 2026-10-06. Complete a separate anonymous-session check and mobile flow verification.
5. Implement authenticated company data, approved email sender, reply/dispute handling and idempotent scheduled follow-up before claiming autonomous operation.
6. Connect subscription billing after seller identity and payment account authorization.
7. Validate the offer and record real acquisition/conversion evidence. Draft outreach materials; sending external messages requires explicit recipient/action authorization.

## Cycle protocol

1. Read this file, current code and any open work before making decisions. Do not rely on temporary scratch files or old chat claims.
2. Check for an existing active work item and continue it before starting a competing change.
3. Choose one bounded deliverable that advances the backlog. Delegate independent QA or research when it improves the result and tools support it.
4. Use an isolated branch for product changes. Verify with an appropriate targeted check. Record exact limitations rather than labelling an untested feature complete.
5. Save changes in the repository and append a dated report under docs/reports/. Update this board with commit/PR links, verification and remaining blockers. Do not merge concurrent changes blindly.
6. Report what actually changed, test evidence, blockers, next decision and accounting only from verified records.

## Privacy and scope

This repository is public. Keep credentials, private finances, personal data, real invoices and prospect contact details out of commits, issues and PRs. Restrict edits to this project; existing businesses and repositories are outside scope. Do not bypass permission failures. Future runs must stop dependent actions if access is missing and continue independent work where possible.

## Initial QA report

A read-only review of index.html at blob 93dfa447c8a09251be68782c2c3fc7b243497627 found that stage labels do not change preview text, the prototype has no persistent commercial-interest capture, and operational integrations remain absent. The fixed date and simulated payment are explicitly labelled.
