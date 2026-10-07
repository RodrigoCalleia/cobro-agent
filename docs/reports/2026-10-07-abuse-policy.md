# Rondacobro abuse-policy preparation — 2026-10-07

## Repository truth

Read the current board, latest retry-identity report, open PRs/branches and current reader, runtime store, disabled handler and hosting configuration through connected GitHub. Starting main: `2d1a61399dfd1db2e58a60d8421a29959b2201d2`; PR #7 head: `e6d50d47472cd5e1427ebe4d3524aaee868eb1e1`. PR #7 was the only open PR. This cycle continued it without introducing a competing product branch.

## Delivered

Prepared [ABUSE_CONTROLS.md](../ABUSE_CONTROLS.md) and linked it from the capture and request-boundary guides. Selected a future native Netlify rule of five requests per 60 seconds per domain/IP, one same-origin endpoint, early rejection before storage, explicit 429/manual-retry behavior, bounded hosted probes and project-scoped containment. This is a policy and acceptance deliverable; no function config, active rule, input form or storage flow was changed.

Official provider facts checked 2026-10-07 materially affect activation: enforcement may lag up to ten seconds; Free has no shared cross-client domain quota; invalid rule validation can leave the deploy green. The policy requires explicit accepted-rule post-processing evidence and checks for aliases, authentication interception and old deploy URLs. It does not claim a hard five-write or expense ceiling.

## Independent review and verification

An independent subagent researched the official Netlify references and reviewed the concrete policy read-only. It approved the inactive document and recommended two refinements, both incorporated: login/401/403 must not count as endpoint evidence, and rollback must also isolate obsolete immutable deploy URLs from production storage.

Verification in this cycle is documentation scope and GitHub readback/diff checking. Code, dependencies, function entry, demo assets and netlify.toml are unchanged. The handler's starting blob is `cadcebef2956b0f0da59529f7a51bbdf85868701`; it remains unconditional 503.

The last code-changing cycle passed 141/141 tests and a static build. Those suites were not repeated for this documentation-only change. No live traffic probe, accepted-rule log, rate enforcement, provider storage or newly active security control is claimed.

## Blocker and next action

Primary integration blocker remains authorized authenticated verification of the existing hosted 503 handler. Preserve preview protection and do not repeat unchanged access probes. Native rate installation additionally requires accepted post-processing evidence before any capture activation.

Next bounded action: implement the selected same-origin/method preflight as an unused server helper with synthetic tests, continuing PR #7. Approved notice/responsible-party/public-contact facts, retry-secret provisioning/versioning, retention/operator access, unique-business measurement and real provider receipt/read/delete remain separate gates. Owner does not receive routine operational work.

## Accounting

Verified recorded spend remains USD 0; verified recorded revenue remains USD 0. No purchase, subscription, third-party message, real invoice, contact capture, customer or revenue metric was created in this cycle. USD 100 maximum experiment authorization is unchanged.

## Primary sources checked 2026-10-07

- https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/ (updated 2026-09-17): rule availability/export, delay, aggregation and post-processing validation.
- https://docs.netlify.com/build/functions/configuration/ (updated 2026-09-17): custom/default routing and platform limits.
- https://docs.netlify.com/build/functions/api/ (updated 2026-07-30): Config and Context identity shape.
