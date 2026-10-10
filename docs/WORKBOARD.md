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

## Working brand — 2026-10-06

- Coordinator selected **Rondacobro** with tagline **Tus cobros, en orden** after the owner's naming request. [Brand brief](BRAND.md) records positioning and copy rules.
- This is a working commercial name, not a legal entity/trademark registration. Preliminary exact-name web research produced no relevant commercial match in returned results; domain, handle and trademark availability remain unverified. No purchase or registration was made.
- Documentation only: deployed demo, repository name, Netlify URL and active PR #7 are unchanged. Commercial demand and payment remain unverified.
- [Decision report](reports/2026-10-06-working-brand.md).

## Autonomous work cadence — 2026-10-06

Owner requested progress without chat messages and a consolidated update when returning. The existing enabled project automation was updated successfully, rather than creating a duplicate coordinator.

- Task title: Avanzar Rondacobro. Configured local windows from 2026-10-07: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00 and 21:00, America/Argentina/Buenos_Aires. This replaces the previous 09:00/19:00 cadence. These are scheduled opportunities, not guarantees of exact timing or completed work.
- Each run reads repository truth, continues open work, selects a bounded useful task, obtains independent QA when available and persists verified results/report before closing. Subagents do not remain active between runs.
- Preserve all budget/access/privacy restrictions and disabled capture gates. Expected-state checks protect concurrent edits. Do not repeat unchanged passing tests or unchanged authentication probes merely to fill a run.
- If a task is blocked, select useful independent work; pause only when all authorized work is actually blocked, with the exact missing prerequisite recorded.
- When the owner returns, read the current board/reports and summarize actual changes since the previous update, separating completed work, pending verification and blockers.
- [Cadence report](reports/2026-10-06-autonomous-cadence.md). A scheduled opportunity is not evidence of a successful execution or delivery.

## Bounded request-reader preparation — 2026-10-07

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its existing isolated branch. No competing product PR was started.

- Added an unused server-only POST/JSON reader: fixed 4096-byte actual stream cap, length hint/EOF matching, fatal incremental UTF-8 decoding and strict existing field validation. It does not import SDK, store records or bind notice/metadata.
- Default two-second read/parse budget (trusted server override up to five seconds), request-abort handling and monotonic checks prevent late acceptance. Cleanup clears timer/listener and cancels/releases without waiting for stalled cancellation; concurrent invocations stay isolated.
- 26 reader tests passed; full branch suite 114/114 passed under Node 24.19.0. Static build produced byte-identical demo assets. Independent QA reran all 114 and added adversarial Unicode/escape, nested-scope, 2000-level, exact-4096-byte and overflow checks without a blocking defect for the unused-helper scope.
- Public function, original validator, SDK/storage modules, demo source assets and netlify.toml are unchanged by this reader update. No capture form, lead record, email, billing or demand evidence is activated.
- Repeated decoded JSON keys now fail with `duplicate_keys` at every object depth, including escaped-equivalent spellings; separate objects keep independent scopes. Unicode normalization, logical-submission deduplication, rate/abuse controls, trusted notice/metadata and retention/privacy gates remain pending. This is an application body-consumption cap, not proof of upstream ingress or full HTTP protection.
- Netlify preview status is successful for duplicate-key product commit `7b79b606436fbd4f0f92dc20d01c29f6ed887ade`, deploy `6ac5e153c6dd45000846098d`; Redirect/Header/Pages checks completed neutral. Hosted test logs, parsing/handler execution and storage acceptance remain unverified. Main documentation ancestry is synchronized into the isolated branch to resolve report/board conflicts, with product code still unmerged.
- [Guide in PR branch](https://github.com/RodrigoCalleia/cobro-agent/blob/product/disabled-interest-route-2026-10-06/docs/REQUEST_BOUNDARY.md) and [cycle report](reports/2026-10-07-request-boundary.md). Exact hosted status is recorded in the report after commit.
- Existing authenticated Netlify preview-handler blocker was not re-probed without changed access evidence. PR #7 remains open pending unavailable-handler verification; actual provider write/read/delete is unverified. Next bounded work: trusted notice/version and server-metadata binding; logical-submission deduplication, rate/privacy/retention gates and commercial validation preparation remain separate.

## Trusted metadata preparation — 2026-10-07

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its existing isolated branch. No competing product PR was started.

- Added an unused server-only record preparer requiring a trusted bounded notice version and generating a cryptographic UUID v4 plus canonical received-at timestamp. It revalidates and copies only the three permitted contact fields.
- Client-supplied ID, timestamp, notice version, network metadata and extra fields fail before trusted generation. Output matches the guarded private-store record contract.
- Independent QA found and drove fixes for overwritten Date methods, rejected async dependencies and Proxy/revoked clock error leakage. Final verification: 15 targeted tests, 129/129 full tests and 25 extra adversarial cases passed; static build still contains only two demo assets.
- Public handler remains unconditional 503 and does not import the reader, preparer or storage path. No form, stored contact, email, billing, customer, demand or revenue evidence is activated.
- [Metadata-binding guide in PR branch](https://github.com/RodrigoCalleia/cobro-agent/blob/product/disabled-interest-route-2026-10-06/docs/METADATA_BINDING.md) distinguishes completed server metadata generation from uncompleted notice approval/display proof. The responsible party, public withdrawal/deletion contact, privacy notice, rate controls, cross-submission deduplication, retention/operator access and real provider acceptance remain gates.
- Netlify marked exact product commit `f3d68dc6c7cdfc33a4e39402bed07ebe1e073ce4` successful in deploy preview `6ac60b44e207e5000799b4c1`; Redirect/Header/Pages checks completed neutral. This is hosted-build evidence, not handler, notice-display or provider acceptance.
- [Cycle report](reports/2026-10-07-trusted-metadata.md).
- PR #7 remains open pending authenticated hosted 503 verification. Next bounded work: server-only logical retry identity/deduplication design, unless verified responsible-party/contact facts become available for the immutable notice contract.

## Retry identity preparation — 2026-10-07

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its existing isolated branch; no competing product PR was started.

- Product commit `1dbec20f196b3afed87772d3a733f9e4793036d7` prepares a server-only HMAC mapping from a canonical random client retry token to a stable opaque UUID v4. Runtime configuration requires at least 32 actual secret bytes; no secret or activation flag is committed.
- Same derived ID and logical contact/business/permission/notice confirm the first record only when the new timestamp is equal or later. The first timestamp is preserved. Earlier time, changed logical data or noncanonical provider data conflict and never overwrite.
- The full local suite passed 141/141; the targeted retry/store suite passed 24/24 and the static build produced only two demo assets. Independent QA found and drove fixes for proxy/config leaks, spoofed secret length, provider normalization and lexical timestamp ordering, then approved the disabled preparation after adversarial and extended-year checks.
- Netlify deploy-preview status for the exact product commit is successful (deploy `6ac636181e447b0008adf345`). Hosted logs and function execution are not inferred. The public handler remains byte-identical and unconditional 503; capture is not activated.
- [Protocol guide in PR branch](https://github.com/RodrigoCalleia/cobro-agent/blob/product/disabled-interest-route-2026-10-06/docs/RETRY_IDENTITY.md) and [cycle report](reports/2026-10-07-retry-identity.md).
- Still pending: browser token lifecycle, route composition, secret provisioning/versioning, rate controls, unique-business measurement, approved notice/display proof, retention, operator authentication and real provider write/read/delete. Existing authenticated hosted-handler blocker was not re-probed without new access evidence.
- Next bounded work: prepare a rate/abuse policy behind the disabled route. Verified spend USD 0; verified revenue USD 0.

## Abuse policy preparation — 2026-10-07

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7); starting heads were main `2d1a61399dfd1db2e58a60d8421a29959b2201d2` and isolated branch `e6d50d47472cd5e1427ebe4d3524aaee868eb1e1`.

- Completed the bounded policy deliverable in [ABUSE_CONTROLS.md](ABUSE_CONTROLS.md): future 5 requests/60 seconds/domain+IP rule, early method/origin checks, manual retry handling, bounded hosted acceptance and project-scoped containment.
- Official sources checked 2026-10-07 confirm delayed enforcement and that invalid rules can leave deployment green. Require accepted post-processing logs; do not call this a global quota or spending cap.
- Independent research/review approved the inactive policy. Incorporated login-interception and obsolete-deploy isolation refinements. All live acceptance checks remain pending.
- Documentation only: no runtime/config/dependency/demo asset changed, no rule or capture activated. No previously passing suite or unchanged login probe was repeated. Last code-changing evidence remains 141/141 tests; this is not a new test result.
- [Cycle report](reports/2026-10-07-abuse-policy.md). Principal integration blocker remains authenticated hosted 503 verification.
- Next coordinator action: implement the selected same-origin/method preflight as an unused helper with synthetic tests, behind the disabled handler in PR #7. Privacy/notice, secret provisioning, retention/operator access, unique-business measurement and real provider acceptance remain separate gates.
- Verified recorded spend USD 0; verified recorded revenue USD 0. No external message, account, subscription, customer, real invoice or contact record was created.

## Same-origin preflight preparation — 2026-10-07

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7), product commit `a8c3ce3c99aeadb189f3019370415999a59cc265`, in its existing isolated branch.

- Added an unused POST/single canonical HTTPS Origin preflight before body consumption. Host/forwarded/override headers cannot grant access; no SDK/body/storage/logging operation is invoked by the helper itself. Origin is not authentication and non-browser clients can forge it.
- Final verification: 14 targeted tests, 155/155 full tests and static build passed. Independent QA ran 21 adversarial probes and found no functional defect; corrected an overly broad Proxy-side-effect claim and added its regression case. Future composition requires the unmodified platform Request.
- Exact product commit has a successful Netlify deploy-preview status. Hosted logs, handler/preflight execution and provider acceptance remain unverified. Public handler stays byte-identical and unconditional 503; no form or native rate rule activated.
- [Guide](PREFLIGHT.md) and [cycle report](reports/2026-10-07-origin-preflight.md). Authenticated hosted 503 verification remains the principal PR integration blocker; unchanged protection was not re-probed or weakened.
- Next useful independent implementation: a testable server-only orchestrator composing prepared validation/retry/metadata/storage, using injected synthetic storage and keeping the public handler disabled. Before live capture still require privacy/responsible-party/contact facts, notice/display proof, secrets, rate controls, retention/private access and actual provider write/read/delete.
- Verified recorded spend USD 0; verified recorded revenue USD 0. No contact, real invoice, customer, external message, subscription or payment created.

## Capture composition and Pago TIC evaluation — 2026-10-07

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7), product commit `8643e79f2795c14a21ecdc8de408d1c873e504bc`, in its existing isolated branch.

- Unused server processor now composes preflight, declared notice-version guard, stable retry identity, bounded validation, trusted metadata and lazy injected storage. Unknown results stay unverified; only exact matching confirmations can return saved success. No private data is echoed.
- Review found and drove correction of a cancellation/deadline issue during provider-result inspection. Final 23 targeted tests, 178/178 full tests and static build passed; independent post-fix adversarial probes cleared the unused scope.
- Existing product modules, public handler/config/dependencies/demo assets remain unchanged; public capture stays unconditional 503. Exact product commit has successful Netlify deploy-preview status; hosted handler and actual provider acceptance are still unverified.
- [Composition guide](CAPTURE_PROCESSOR.md), [Pago TIC evaluation](PAGOTIC_REVIEW.md), [cycle report](reports/2026-10-07-capture-composition-and-pagotic.md). Payment candidate only; no account/contact/API call/charge. Eligibility, commissions, settlement and currency remain unresolved, and partial competitive overlap is an inference requiring value validation.
- Principal integration blocker remains authenticated hosted 503 verification. Privacy/responsible party/public contact, notice/display proof, secrets, native rate controls, retention/operator access and real storage readback/deletion still gate capture.
- Next independent task: browser submission/retry/error controller with injected synthetic transport, without adding public contact inputs or auto-retry loops. Payment selection waits for verified current commercial conditions and authorized access/contact.
- Verified recorded spend USD 0; verified recorded revenue USD 0. No customer or demand evidence invented.

## Browser capture lifecycle — 2026-10-07

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7), product commit `5ca876a086b864978b4d50c0d271955240ce7ff6`, on its existing isolated branch.

- Added an unused browser-compatible controller with injected transport: unchanged manual retry keeps one token, changed draft gets a new identity, double submission/stale completions are suppressed, notice mismatch requires explicit replacement and a fresh affirmative decision. Exact 200 confirmation is distinct from 202 unverified; no automatic retry, default fetch, DOM input, browser storage or logging.
- Engineering 24 targeted tests passed. Coordinator final 203/203 full tests and static build passed. Independent QA found and verified correction of a token-generator reentrancy race. One persisted synthetic browser/server/store integration regression covers lost-response retry/original timestamp, changed identity and renewed notice decision. No actual provider, DOM or mobile pass is claimed.
- Existing product/handler/config/dependencies/demo blobs are unchanged; static output remains two byte-identical demo assets. Public capture stays unconditional 503.
- Initial product commit Netlify preview failed, deploy `6ac69c984b90cc0008629da6`; a focused dashboard read exposes Log in and no logs, so cause remains unknown. Later documentation head `78014b65168faba48d193963d92c18f6e108f56d` has successful preview status with every product blob identical. Preserve both outcomes: no diagnosed fix, hosted test-log count, handler execution or provider acceptance is inferred. No protection change or merge.
- [Guide](BROWSER_CAPTURE.md) and [cycle report](reports/2026-10-07-browser-capture-lifecycle.md). Next priority: authenticated hosted 503 acceptance and activation gates. Diagnose the initial failed build when logs become accessible; avoid speculative fixes/retriggers while identical current code has a successful preview. Prioritize privacy/identity/contact/notice, secrets/rate/retention/private-access and actual provider acceptance gates before adding more capture helpers.
- Keep agency/consultancy follow-up positioning narrow; Pago TIC's overlap means value and price still require validation. No AI model, outreach, customer, live invoice or payment activated. Recorded spend USD 0; recorded revenue USD 0.

## Simulated invoice follow-up editing — 2026-10-07

Prepared independent [PR #8](https://github.com/RodrigoCalleia/cobro-agent/pull/8), product commit `10f4e7c584fe471f083973c1fc9a6cea8f3a4410`, from main `9f849c089b4cb9d59d879ef6d67b75c1b9aa0ea6`. PR #7's capture work remains open and untouched; chose an allowed demo workflow while its activation gates are blocked.

- Added **Simular seguimiento** to existing unpaid fictional invoices: pending/disputed state, optional promise and last-contact date. Same invoice/amount/due date preserved; clearing context resumes eligible previews, current promise/dispute/recent contact pauses them, paid invoices are protected. Fixed simulation date/in-memory only; no messages or money.
- 12 new plus 27 existing engine tests passed in engineering; coordinator final 77/77 main-based branch tests and static build passed. Independent QA cleared transition/date/immutability/paid guards. Real inline UI passed an injected DOM simulation, with native dialogs/focus/constraint validation/layout/mobile still unverified.
- Exact product commit has successful Netlify deploy-preview status. Preview build is not hosted UI execution. Build remains two matching assets; storage/config/dependencies unchanged.
- Native remote-browser/local-preview attempt failed with ERR_CONNECTION_REFUSED; local server stopped. PR #8 remains draft/unmerged pending reachable native desktop/mobile checks. Production unchanged; do not claim this feature is published.
- [Cycle report](reports/2026-10-07-demo-followup-editing.md). Next: verify this bounded workflow before integration/expansion. Keep capture acceptance, approved privacy/contact/notice, runtime secrets/rate/retention/private access and actual storage acceptance as separate gates.
- Recorded spend USD 0; recorded revenue USD 0. No customers, outreach, private data, real invoices, payments or live AI operation.

## Native desktop follow-up verification and Netlify access — 2026-10-07

- GitHub sign-in to the existing Netlify account succeeded at the owner's explicit request; the project dashboard and authenticated PR #8 preview opened. This resolves access for this session, without changing protection or promising persistence across future sessions.
- Native desktop checks passed for promise/contact/dispute pause and resumption, cancel/Escape, future-contact constraint, exact 72-hour resumption, draft display, simulated payment, parsed JSON export and reset. Fixed invoice identity/amount/due stayed unchanged.
- Native review found keyboard focus lost after saving. [Focus correction f5ee970](https://github.com/RodrigoCalleia/cobro-agent/commit/f5ee9700c7ada82f263f6de8e0f10ef1c7862530) is on existing [PR #8](https://github.com/RodrigoCalleia/cobro-agent/pull/8). Syntax/static build passed; exact commit Netlify preview status is successful. After reload, native checks confirmed same-invoice focus restoration for both pause and resumption.
- PR #8 stays draft/unmerged pending native mobile acceptance. This scoped DOM correction did not repeat the 77-test suite or receive independent second review. No hosted full-suite log count, mobile pass or public feature publication is claimed.
- [Native verification report](reports/2026-10-07-native-followup-verification.md). Next: complete mobile review, then integrate after current-head/main/check review; use authenticated access for PR #7's separate unavailable-handler acceptance. Do not repeat generic login probes while the session is usable.
- Capture stays disabled. Approved responsible party, public privacy/contact channel and notice are still missing; secrets/rate/retention/private access and actual provider acceptance remain separate gates. Recorded spend USD 0; recorded revenue USD 0.

## Hosted failure diagnosis and deadline cause correction — 2026-10-07

- Read the authenticated Netlify log for failed deploy 6ac69c984b90cc0008629da6 / product 5ca876a: 203 tests, 202 pass, one failure in the hanging-transport deadline case. Actual request_interrupted replaced expected request_timeout when the timer fired just before the monotonic boundary. The previously unknown cause is now diagnosed; the later identical-code green build was not a fix.
- Continued [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) with [correction 3afcd54](https://github.com/RodrigoCalleia/cobro-agent/commit/3afcd545ef044454d7ab5163c8bd37134c023ffb): per-attempt timer-cause latch plus final monotonic check. A deterministic early-timer regression covers aborted/late response behavior. No budgets expanded or capture activated.
- Engineering 25/25 controller tests; independent review and 5/5 focused tests; coordinator 26/26 controller/composition and 204/204 complete local tests plus static build passed. Exactly two product files changed. Exact product commit Netlify preview status is successful; no new hosted test-log count or provider/handler pass inferred.
- Independent audit also cleared PR #8's focused keyboard fix in source. PR #8 stays draft pending native mobile; no new native/mobile pass claimed.
- Authenticated function-navigation observation was rejected by browser URL/protocol policy. Hosted GET/POST 503 acceptance remains pending; no workaround, status/body claim or unchanged re-probe. PR #7 stays open/unmerged.
- [Diagnosis and verification report](reports/2026-10-07-deadline-cause-fix.md). Next: permitted hosted-handler acceptance and supported mobile verification, then integrate after current-head/main/check review. Privacy/contact/notice, secrets/rate/retention/operator access and actual synthetic provider acceptance still gate capture.
- Recorded spend USD 0; recorded revenue USD 0. No real invoices, customers, outreach, payments, subscriptions or new accounts.


## Commercial validation playbook — 2026-10-07

- Prepared [PLAYBOOK_VALIDACION_COMERCIAL.md](PLAYBOOK_VALIDACION_COMERCIAL.md) from the current pilot/brand/payment hypothesis. It defines a neutral discovery sequence, four-part business qualification, explicit yes/no/conditional price evidence, objection categories and separate stages for interest, contract and confirmed payment.
- Decision rule: review after 10 qualified businesses or 30 days from the first authorized conversation. Continue with at least 3 distinct explicit price/scope acceptances; change one variable after weaker evidence or a repeated correctable objection; stop the hypothesis after 0/10 acceptances or when at least 6/10 do not have a recurring problem. These are future experimental thresholds, not demand evidence.
- Independent audit required complete denominators and negative/conditional results, separation of unique businesses from retry tokens/submissions, comparison with existing tools and reconfirmation once currency/taxes/fees form a final chargeable price.
- No outreach, prospect list, personal data, capture, checkout, account or subscription was created. Do not add commercial interview fields to the technical capture allowlist or use this public repository as a CRM.
- [Cycle report](reports/2026-10-07-commercial-validation-playbook.md). PR #7 remains pending permitted hosted-handler acceptance; PR #8 remains draft pending supported mobile acceptance. Identity/privacy/contact, operational and payment gates remain separate.
- Recorded spend USD 0; recorded revenue USD 0; verified qualified businesses, price acceptances and payments: 0.


## Mobile-readiness accessibility correction — 2026-10-08

- Continued draft [PR #8](https://github.com/RodrigoCalleia/cobro-agent/pull/8) with [product commit ba573a8](https://github.com/RodrigoCalleia/cobro-agent/commit/ba573a86475c835c39db90020cb53a99f7856469): 44px minimum controls, a named/focusable horizontal invoice region with visible focus and invoice-specific accessible names for repeated row actions.
- Product scope remains fictional and in-memory. No capture, network, storage, delivery, payment or customer data was added; focus restoration and invoice identity guards were preserved.
- New focused result 13/13; complete branch suite 78/78, syntax and static build passed. Independent post-fix review approved the exact source delta and ran the focused regression 1/1. Exact commit Netlify preview status is successful.
- This is source/build evidence, not native mobile acceptance. The available surface did not provide a real mobile viewport, touch, rendered-size or screen-reader session. PR #8 stays draft/unmerged and production remains unchanged.
- [Cycle report](reports/2026-10-08-mobile-readiness-accessibility.md). Next: supported native mobile acceptance, then current-head/main/check review before integration. PR #7 hosted-handler/privacy gates remain separate and unchanged.
- Recorded spend USD 0; recorded revenue USD 0. No customers, outreach, real invoices, payments, subscriptions or new accounts.

## Privacy activation readiness — 2026-10-08

Privacy preparation for the disabled pilot-interest path is now explicit in [PRIVACY_READINESS.md](PRIVACY_READINESS.md). This is an operational gate, not legal advice or a compliance claim.

- Scope remains limited to a business email, optional business name and affirmative permission. No invoice, debtor, balance, free-text or sensitive data belongs in this capture.
- The notice template now lists the responsible party's identity and domicile, database/storage existence, purpose and recipients, required/optional status, consequences, rights route, retention and provider/transfer facts. Unresolved values remain visible placeholders; none were inferred from Rodrigo's public profile.
- Current AAIP guidance was checked. The operating target is access within 10 calendar days and rectification/update/suppression within 5 business days. An independent review confirmed these timings and warned that an email address alone is not a sufficient notice.
- Registration applicability is unresolved: AAIP wording and interpretation are broader than “selling data.” The responsible party must obtain a documented applicability decision and complete any required registration before activation.
- Cloud/international-transfer readiness is unresolved. Netlify/provider contract, processing locations, subprocessors and lawful transfer mechanism have not been verified; no country or adequacy assumption was made.
- Capture stays disabled. Hard blockers are an approved responsible identity/domicile/privacy contact, registration decision, approved notice version, retention period, processor/transfer facts, operator procedure and synthetic private write/read/delete evidence.
- No product code, deployed form, customer record, outreach, payment or subscription changed. Source review only; unchanged tests were not rerun.
- [Cycle report](reports/2026-10-08-privacy-readiness.md).
- Next: the owner supplies or approves the accountable legal identity and privacy channel; the coordinator then verifies provider facts and turns the checklist into an acceptance packet. PR #7 remains open and unavailable until all activation gates pass.

## Suppression replay interlock — 2026-10-08

PR #7 product commit [a3ca538](https://github.com/RodrigoCalleia/cobro-agent/commit/a3ca538d474e26bde20a5f207320b71bedc18ee2) prepares request-level suppression without enabling capture.

- Suppression replaces the current record with a minimal marker at the same opaque key; delayed and replayed create-only writes cannot replace it.
- Production physical deletion is unavailable before provider access, closing the independently reproduced `suppress → delete → create` reopening path. Test-only cleanup remains available.
- The pinned Netlify SDK path covers unconditional overwrite, strong read and a blocked conditional replay using only synthetic in-process transport.
- Coordinator verification: 209/209 local tests and static build passed. Independent post-fix review ran 67 focused tests and found no commit blocker.
- Scope is intentionally narrow: one request ID only. Full contact lookup across tokens, rectification, direct-provider controls, backup/log treatment, marker retention/secret rotation and terminal public response remain unresolved.
- Public handler and form remain unavailable; no provider record, lead, email, payment or customer activity was created.
- [Cycle report](reports/2026-10-08-suppression-interlock.md).
- Next: prepare a privacy-preserving private contact index and multi-ID rights workflow; keep PR #7 open until legal/provider/hosted acceptance gates pass.


## Explicit EU Blob storage region — 2026-10-08

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its existing isolated branch; product commit [41774a4](https://github.com/RodrigoCalleia/cobro-agent/commit/41774a4740193745b9463c0deed3ba128c7931ee) removes the implicit default-US Blob storage location without enabling capture.

- Both test and production stores now explicitly select Netlify Blobs region `eu-central-1` with strong consistency. The pinned SDK 11.1.1 was exercised through synthetic transport and its direct API URL carried `region=eu-central-1`.
- Coordinator verification: 210/210 local Node tests and the static build passed; output remains exactly the two demo assets. Independent review found no inactive-commit blocker.
- This is a storage-location preparation only. No live Blob, migration, provider acceptance, contact, invoice, email, payment or demand evidence was created.
- Netlify Functions still default to `cmh` (Ohio); selecting another function region is documented for Pro/Enterprise. No plan change, subscription or spend was authorized. Do not claim European-only processing or legal compliance.
- Public form and handler remain unavailable. Contract, subprocessor, logs/support, transfer, responsible-party, privacy-channel and actual synthetic provider acceptance gates remain open.
- [Cycle report](reports/2026-10-08-eu-blob-region.md).
- Next: design the privacy-preserving private contact index and multi-ID rights workflow on this fixed region, while keeping PR #7 open and capture disabled.

## Private contact index preparation — 2026-10-08

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch. Added preparation-only `server/pilot-contact-index.cjs` and focused tests; no handler, form or provider adapter calls this module.

- A normalized contact is passed only to an injected server-side token derivation; raw email is never used as a key or returned by the module.
- One opaque contact token can reference multiple validated request IDs, with idempotent re-addition and a bounded maximum. Corrupted stored values fail closed.
- `add()` requires an injected atomic `update(token, updater)` contract; a synchronous in-memory test adapter demonstrates the intended critical section and a concurrent two-ID regression.
- Coordinator verification: **216/216** complete Node tests passed (six new index tests) and static build produced exactly two demo assets. Focused index run: **6/6**.
- Independent audit found the concurrency contract is now explicit; real-provider CAS/serialization remains unverified. No live write, contact, lead, email or provider data was created.
- This is not a complete rights workflow: it still needs a trusted keyed/versioned derivation, a provider-backed atomic update, multi-ID suppression/rectification orchestration, retention/rotation decisions and operator controls.
- [Cycle report](reports/2026-10-08-private-contact-index.md).
- Next: verify the provider adapter's atomic guarantee or retain the index as design-only, then add synthetic multi-ID suppression/rectification composition tests without enabling the public route.

## Append-only contact membership — 2026-10-08

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) after checking current Netlify documentation.

- Official provider guidance confirms Blobs is last-write-wins and has no general concurrency control. The shared contact array design was therefore replaced before integration.
- Each association now uses its own private `token/requestId` key, created conditionally. Listing by the exact trailing-slash prefix locates all membership keys without concurrent writers touching one object.
- The module never returns the derived token. Provider response normalization remains an adapter responsibility and is documented in code; no SDK adapter or live store is connected.
- Seven focused tests cover distinct-key concurrency, duplicate create-only behavior, bounded processing, malformed provider shapes and isolation between distinct contacts.
- Coordinator verification: **217/217** complete tests and static build passed. One earlier full run exposed two transient unchanged deadline-test failures; a focused 32-test run and the final full rerun passed.
- Independent audit approved the pure append-only design and identified pre-activation requirements: actual SDK adapter tests, token-secret version history, retention/tombstones, trusted contact-ID binding and resource-bounded listing.
- [Cycle report](reports/2026-10-08-append-only-contact-index.md).
- Next: implement and test a normalized, still-disconnected SDK adapter for `onlyIfNew` plus complete prefix listing; do not enable capture.

## Netlify contact-index SDK adapter — 2026-10-08

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added disconnected `server/netlify-contact-index.cjs` for the pinned Netlify Blobs 11.1.1 SDK. It opens separate test/production stores with strong consistency in `eu-central-1`.
- Create-only writes use `onlyIfNew` and normalize the SDK's `{modified, etag}` response to `{modified}`. Prefix listing consumes the SDK async iterator, normalizes blob entries to keys and enforces the ID limit during pagination.
- The persisted in-process SDK transport test covers successful create, duplicate HTTP 412, two list pages with `next_cursor`, exact prefix, EU region and isolated store path. No network or provider record is used.
- Coordinator verification: **10/10** focused tests, **220/220** complete tests and static build passed. Independent review found no preparation-scope blocker and verified the same 412/pagination behavior before it was persisted.
- Adapter remains disconnected from the public function. HMAC/versioned token derivation, secret rotation, generic public error mapping, retention and trusted record binding remain activation gates.
- [Cycle report](reports/2026-10-08-netlify-contact-index-adapter.md).
- Next: prepare versioned HMAC token derivation and rotation-compatible lookup with synthetic secrets; keep capture unavailable.


## Versioned HMAC contact tokens — 2026-10-08

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added disconnected HMAC-SHA256 derivation with one active and at most two previous unique key versions. New memberships use only the active token; lookup searches active and retained previous tokens.
- Tokens are exact 64-character lowercase hex values with domain/version separation. Secrets are copied into private Node.js key objects and are never returned. Tests use only synthetic secrets.
- Rotation lookup deduplicates IDs across versions, rejects duplicates within one version, applies one total processing bound and fails instead of returning partial results. Contact controls C0/C1 now fail before derivation.
- Coordinator verification: **21/21** focused tests, **231/231** complete tests and static build passed. Independent post-correction review approved the disconnected preparation and confirmed no public handler imports it.
- Capture remains unavailable. Real secret loading, version-retention/migration policy, trusted record binding, generic public error mapping and provider acceptance remain activation gates. Version labels must never be reused and old keys cannot be retired while retained memberships still depend on them.
- [Cycle report](reports/2026-10-08-versioned-contact-tokens.md).
- Next: prepare synthetic disconnected composition across keyring, contact index and Netlify adapter for multi-ID rights workflow planning; do not enable capture.


## Private multi-ID rights plan — 2026-10-08

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added disconnected private composition across the versioned HMAC keyring, contact index, Netlify adapter and request store.
- A membership can be indexed only after the exact stored record is validated and its normalized contact matches. The composed API reports only `indexed-confirmed`, never an unproven creation event.
- Multi-ID planning covers active and retained key versions, separates already-suppressed IDs, sorts opaque IDs and fails without partial output on any mismatch or unavailable record. Planning performs no suppression.
- Contact-index writes now require strong readback of the exact membership marker. This closes a reproduced SDK 11.1.1 false-success path for unexpected HTTP statuses.
- Coordinator final verification: **31/31** focused tests, **239/239** complete tests and static build passed. Independent post-fix review approved the disconnected scope, repeated the same test totals and confirmed no public handler import.
- Capture remains unavailable. Dual-write reconciliation, a consistent execution snapshot, provider deadlines, future executor revalidation, operator authorization, secrets/retention and privacy/provider gates remain open.
- [Cycle report](reports/2026-10-08-private-rights-plan.md).
- Next: prepare bounded disconnected reconciliation for stored requests missing contact membership; do not enable capture.


## Disconnected membership reconciliation — 2026-10-09

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added a private inventory plan for stored requests missing opaque contact membership. Request pages, total blobs, IDs and index work are bounded; malformed or unavailable state returns only `unverified`, never partial results.
- Exact canonical active records are classified as indexed or missing across current/retained HMAC versions. Suppression markers are reported separately without attempting to reconstruct erased contact data. Repeated contacts share one index lookup.
- The ready result contains only sorted opaque IDs. Planning performs no write, repair, suppression or deletion and remains outside the public route/browser import graph.
- Independent review found and caused fixes for unlimited empty-page iteration and repeated contact lookup. It confirmed that any future executor must revalidate the non-atomic plan and that abortable provider deadlines remain mandatory before activation.
- Coordinator verification: **33/33** focused tests, **245/245** complete tests and static build passed; output remains exactly two demo assets.
- No live provider record, contact, invoice, email, payment, customer or demand evidence was created. Capture remains unavailable. Spend **USD 0**, revenue **USD 0**, leads/customers **0**.
- [Cycle report](reports/2026-10-09-disconnected-reconciliation-plan.md).
- Next: add abortable shared deadlines to private request and contact list/read operations using synthetic stalled transports. Do not run repairs or enable capture.


## Reconciliation shared deadline — 2026-10-09

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added a disconnected runtime with one abortable budget for the complete reconciliation plan: SDK loading, request inventory pages, strong request reads, contact-index pages, SDK retries and response bodies.
- Both private stores share one guarded transport within a plan, preventing deadline resets per page/contact/key version. Concurrent and later plans have separate controllers.
- Expiry returns only `unverified`. Late SDK loads, strong reads or list bodies cannot produce `ready` or trigger follow-up storage requests. The runtime performs no write, repair, suppression or deletion.
- Independent pre/post implementation review approved the shared-deadline design with no persistence blocker and independently repeated **33/33** combined runtime/deadline tests.
- Coordinator verification: **8/8** new runtime tests, **253/253** complete tests and static build passed; output remains exactly two demo assets. The runtime is absent from the public function/browser import graph.
- No provider record, contact, invoice, email, payment, customer or demand evidence was created. Capture remains unavailable. Spend **USD 0**, revenue **USD 0**, leads/customers **0**.
- [Cycle report](reports/2026-10-09-reconciliation-deadline.md).
- Next: prepare a disconnected single-ID repair primitive with immediate exact revalidation and idempotent create-only membership. Use synthetic stores only; do not schedule repairs or enable capture.


## Single-ID repair primitive — 2026-10-09

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added a disconnected single-request repair primitive for the stored-request/contact-index dual-write gap.
- It re-reads the exact request, revalidates the binding before a possible write, uses create-only membership, confirms with strong readback, and performs a final binding re-read before returning `indexed-confirmed`.
- Suppression races return only `suppressed`; malformed/provider uncertainty returns only `unverified`. Public output contains no contact, token, request data or provider metadata.
- Independent audit approved the bounded design and identified/closed the final suppression window. Coordinator verification: **5/5** new repair cases, **258/258** full tests, static build with exactly two assets, and no public import.
- No provider/customer data or real leads were created. Capture remains unavailable. Spend **USD 0**, revenue **USD 0**, leads/customers **0**.
- [Cycle report](reports/2026-10-09-single-id-repair.md).
- Next: keep repair disconnected; define operator authorization/audit-log requirements and obtain remaining private acceptance evidence. Do not schedule repairs or enable capture.

## Operator repair authorization contract — 2026-10-09

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added a disconnected exact command/authorization gate for one single-ID contact-index repair. It binds operation, request, action, production environment, site, fixed reason and policy before any write path.
- Trusted grants use opaque actor/authorization references, canonical timestamps and at most five minutes of validity. Caller-supplied identities, free-text reasons, extra properties and accessors are rejected.
- An append-only audit `started` claim is required before repair. A maximum 60-second exclusive lease blocks concurrent replay; terminal results must echo-bind request, actor and policy, and stale claims cannot complete.
- Independent audit reproduced and prompted correction of an accessor-based privacy flaw, binding gaps and stale-lease completion. Final independent review approved the disconnected scope with **14/14** focused tests.
- Coordinator verification: **272/272** complete tests and static build passed; output remains exactly two demo assets. No public function/browser import exists.
- No operator/provider/customer data or real lead was created. Capture remains unavailable. Spend **USD 0**, revenue **USD 0**, leads/customers **0**.
- [Contract](OPERATOR_REPAIR_CONTRACT.md) and [cycle report](reports/2026-10-09-operator-repair-contract.md).
- Next: prepare a disconnected append-only audit-store adapter with atomic operation binding and exclusive claim semantics using synthetic transports only. Do not connect the gate, schedule repairs or enable capture.

## Operator audit CAS adapter — 2026-10-09

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added a disconnected private audit adapter using one bounded document per operation. Initial claims use create-only writes; recovery and terminal events use ETag compare-and-swap, keeping binding, exclusive lease and terminal state in one atomic document boundary.
- Authorization expiry is now part of the start event. Claims last at most 60 seconds, cannot outlive a five-minute authorization, cannot overlap or reuse fencing IDs, and stored history/readback must match exactly. Slow lease crossings fail closed.
- The history is append-only at application level, not physical WORM or regulatory immutability. The fixed strong-consistency EU store exposes no list/delete method and remains disconnected from routes, jobs and real identities.
- Independent design/post-implementation review found and caused corrections for multi-key races, partial readback, invalid chronology, repeated claim IDs and lease crossings; final review approved the disconnected component with **27/27** focused tests.
- Coordinator verification: **285/285** complete tests and static build passed; output remains exactly two demo assets. Import inspection found no public function/browser use.
- No provider/operator/customer data, lead, outreach, payment or subscription was created. Capture remains unavailable. Spend **USD 0**, revenue **USD 0**, leads/customers **0**.
- [Contract](OPERATOR_REPAIR_CONTRACT.md) and [cycle report](reports/2026-10-09-operator-audit-cas.md).
- Next: prepare a disconnected runtime composition with one shared abortable deadline across SDK loading, authorization, audit CAS/readback, repair and terminal persistence. Do not connect routes/jobs or enable capture.

## Operator runtime and demo visual pass — 2026-10-09

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added a disconnected runtime facade that validates the published production site and uses one abortable deadline for SDK loading, injected authorization, audit CAS/readback, single-ID repair and terminal persistence. A stalled SDK load returns unverified without authorization or repair; the module is not imported by a route or scheduler.
- Runtime-focused tests: **3/3 passed**. The complete repository suite is **288/288 passed** and the static build produced exactly two demo assets.
- Refreshed the fictional demo visual system: clearer Rondacobro identity/status, stronger hero and pilot hierarchy, summary metrics, responsive workspace/mobile layout, focus states, framed table/dialogs and explicit no-connection/no-payment copy. Rules and simulation behavior remain unchanged.
- No route, browser capture, provider write, operator/customer data, lead, outreach, payment or subscription was added. Capture and repairs remain unavailable. Spend **USD 0**, revenue **USD 0**, leads/customers **0**.
- [Cycle report](reports/2026-10-09-operator-runtime-visual.md).
- Next: review the visual preview on desktop/mobile and prepare a synthetic read-only runtime acceptance check. Keep real authorization, retention, rate limits, provider acceptance and activation blocked.

## Synthetic operator runtime acceptance — 2026-10-09

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Added a read-only synthetic end-to-end acceptance for the disconnected runtime: target-bound authorization, one CAS audit claim, exact request/contact revalidation, idempotent membership creation and terminal audit completion share one abortable deadline.
- A stalled SDK load returns unverified before authorization or repair. The successful fixture verifies the logical claimed/completed audit events using only in-memory stores, synthetic UUIDs and a fictional contact.
- Runtime-focused tests: **4/4 passed**. Coordinator verification: **289/289** complete tests and static build with exactly two demo assets.
- No public route, scheduler, browser import, live provider, operator identity, customer record, outreach, payment or subscription was added. Capture and real repairs remain disabled. Spend **USD 0**, revenue **USD 0**, leads/customers **0**.
- [Cycle report](reports/2026-10-09-runtime-acceptance.md).
- Next: keep this runtime disconnected while preparing provider/privacy acceptance criteria; do not authorize real repairs or enable capture.

## Operator runtime transport hardening — 2026-10-10

Continued open [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) on its isolated branch.

- Applied the strict verified audit transport inside the disconnected runtime. Conditional audit PUTs now accept only HTTP 200 success or HTTP 412 conflict before the pinned SDK can normalize an unexpected status.
- Added regressions proving a stalled authorization consumes the shared deadline without starting a claim and a misleading PUT 201 is rejected before audit readback.
- Independent review approved the minimal audit-only wrapper placement with no blocker and no contact/privacy leak. Runtime-focused tests: **6/6**; complete suite: **291/291**; static build passed with exactly two demo assets.
- No public route, scheduler, real identity/provider record, customer data, outreach, payment or subscription was added. Capture and repairs remain disabled. Spend **USD 0**, revenue **USD 0**, leads/customers **0**.
- [Cycle report](reports/2026-10-10-operator-runtime-hardening.md).
- Next: exercise pinned SDK conditional headers/EU/strong behavior and separate stalled claim, repair and terminal completion cases. Keep activation blocked.

## Pinned SDK audit acceptance — 2026-10-10

- Product commit a1b72a7 corrects a real compatibility defect found by exercising the installed @netlify/blobs 11.1.1 store: audit methods live on the SDK store prototype, while the previous strict adapter accepted only an exact plain object. Safe descriptor-based method discovery now supports the pinned SDK without invoking accessors.
- Synthetic installed-SDK acceptance verifies uncached strong reads, eu-central-1 routing, initial If-None-Match: *, terminal If-Match with the prior ETag, and exact readback through claim plus completion.
- A separate timeout regression proves a stalled audit claim consumes the shared budget and starts zero repair-store calls.
- Independent audit selected SDK-backed CAS and per-stage timeout evidence as the highest-value gap. Coordinator verification: 22/22 focused tests, 294/294 full tests and a static build with exactly two assets.
- Netlify reports a green deploy preview for product commit a1b72a7. No route, scheduler, provider record, real operator/customer identity, capture, outreach or payment was enabled. Spend/revenue remain USD0/USD0.
- Next: cover stalled repair and stalled terminal persistence, including late resolution and replay. Report: docs/reports/2026-10-10-pinned-sdk-audit-acceptance.md.


## Runtime terminal deadlines and merge safety — 2026-10-10

- Two runtime regressions cover the remaining shared-deadline stages. A stalled repair returns unverified, appends no terminal audit and cannot continue after late resolution. A stalled terminal CAS also returns unverified; if the uncertain write later becomes durable, replay reads the terminal result without repeating repair.
- Coordinator verification passed 296/296 tests and the static build produced exactly two assets.
- Independent review confirmed PR #7 is currently clean, 44 commits ahead and zero behind main; rebaseable false is a history-shape limitation, not a textual conflict.
- The same review found a semantic merge hazard: three current main documents appeared as deletions. This cycle restores docs/PLAYBOOK_VALIDACION_COMERCIAL.md, docs/reports/2026-10-07-commercial-validation-playbook.md and docs/reports/2026-10-08-mobile-readiness-accessibility.md byte-for-byte from main.
- Before merge, repeat the compare and require zero unapproved removed files plus a green preview for the new head. No route, scheduler, capture, real repair, customer data, outreach or payment was enabled. Spend/revenue remain USD0/USD0.
- Report: docs/reports/2026-10-10-runtime-timeouts-merge-safety.md.

## PR #7 controlled integration — 2026-10-10

- PR #7 was merged into main with merge commit c86f14d after an exact-head lease check.
- Final compare before merge: 45 commits ahead, 0 behind, clean merge and 0 removed files. Netlify preview for head b034471 was green.
- Independent final audit reran 296/296 tests from an exact clone and built exactly two byte-identical demo assets.
- The three current-main documents identified as semantic deletions were restored byte-for-byte before merge.
- The public pilot-interest function remains unconditional HTTP 503/unavailable and imports no SDK/runtime activation. Operator runtime and capture remain disconnected from routes and schedulers.
- Main now contains the durable privacy, storage, reconciliation, audit and timeout preparation, but this is not authorization to use real identities, records or repairs.
- Production deploy status for merge commit c86f14d was not yet reported by GitHub at closeout; do not infer publication from the successful PR preview.
- Spend/revenue remain USD0/USD0; verified leads/customers remain 0.
- Report: docs/reports/2026-10-10-pr7-integration.md.


## Production demo drift verification — 2026-10-10

- The refreshed public site at https://cobro-agent-rodrigo.netlify.app/ still shows the older `Cobro · prototipo` / `cobro.` experience and the old action labels.
- Merged `main` at `cea02c8` contains the new `Rondacobro · simulación B2B` visual, product-status card and updated workspace/action copy. Therefore the latest integrated revision is not yet proven published.
- Independent read-only review confirmed production is stale but could not determine whether the cause is a missing build, incorrect branch/publish directory or older production assignment.
- The available Netlify dashboard requires authentication, so the production deploy ID/log and retry controls could not be inspected. GitHub reports no commit status for `cea02c8`; do not infer deployment.
- The observed old production remains explicitly demo-only: no email, payments, registration or storage is presented as connected, and no capture input was observed. This cycle did not call the disabled capture endpoint or execute any repair/provider write.
- No code changed, so the already accepted 296-test suite was not repeated without new product evidence.
- Spend **USD 0**, revenue **USD 0**, verified leads/customers **0**.
- [Verification report](reports/2026-10-10-production-demo-verification.md).
- Next: authenticate to the existing Netlify project, inspect the production assignment, rebuild/promote merged `main` while keeping capture and repairs disabled, then verify the public Rondacobro markers on desktop/mobile.


## Netlify production recovery preparation — 2026-10-10

- Current `main` is `0eb5097`; GitHub exposes zero Actions/check runs and no commit-status entry proving a production deploy.
- The available environment has no authenticated Netlify dashboard session, CLI, auth token or site ID, so production configuration could not be inspected or mutated.
- Independent review selected recovery of the existing production demo as the highest-impact next action and warned against touching/promoting draft PR #8, which is 52 commits behind `main` and not mergeable.
- Added a fail-closed [production recovery procedure](NETLIFY_PRODUCTION_RECOVERY.md): verify repository/production branch, inspect the currently assigned deploy, rebuild or promote only current `main`, then require exact public Rondacobro desktop/mobile markers.
- The procedure forbids publishing PR previews, changing away from `main`, adding secrets or enabling capture, forms, storage, repairs, email or payments.
- No product/provider configuration changed and no endpoint was invoked. The 296-test suite was not repeated because there is no code change.
- Spend **USD 0**, revenue **USD 0**, verified leads/customers **0**.
- [Cycle report](reports/2026-10-10-netlify-production-recovery.md).
- Next: obtain authenticated access to the existing Netlify project, execute the bounded recovery and record deploy ID/source commit/public evidence before declaring publication.

## Draft PR #8 port to current Rondacobro — 2026-10-10

- Reconciled the existing draft follow-up simulation with current `main` using a two-parent merge candidate; no competing product PR was created.
- The sole textual conflict was `index.html`. Resolution preserves the current Rondacobro identity, hero, pilot, metrics, workspace and blue focus system while porting only the fictional follow-up modal/status/handlers.
- Unpaid demo invoices can change or clear dispute, promise and last-contact context; the same invoice is recalculated while identity, amount and due date remain fixed. Paid invoices stay protected.
- Accessibility port includes 44px controls, a named/focusable horizontal invoice region, invoice-specific action names and focus restoration after save.
- Complete suite: **309/309 passed**. Static build produced exactly two public demo assets. Independent review ran **9/9** synthetic helper probes and approved the minimum-delta approach.
- No public capture, provider write, storage, repair route, scheduler, email, payment or real data was connected.
- Netlify reports a successful preview build for the reconciled PR head at `https://deploy-preview-8--cobro-agent-rodrigo.netlify.app`, but unauthenticated access redirects to Team Protection. Hosted desktop and native mobile/touch acceptance therefore remain unverified; PR #8 stays draft and its preview must not be promoted to production.
- Spend **USD 0**, revenue **USD 0**, verified leads/customers **0**.
- [Cycle report](reports/2026-10-10-followup-port-main.md).
- Next: use authorized preview access to inspect desktop and narrow mobile behavior; keep production recovery separate.
