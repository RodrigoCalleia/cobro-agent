# Cobro Agent workboard

## Purpose

Validate an automated B2B invoice follow-up product for small agencies and consultancies. The owner observes and comments; the coordinating agent chooses and executes routine work within the granted access.

## Verified status — 2026-10-05

- Interactive prototype is stored in index.html.
- Fictional invoices, manual test-invoice entry, decision rules, reminder preview, simulated payment and JSON export exist.
- Runtime state is in memory and resets on reload. The simulation date is fixed and labelled.
- No deployment is recorded. No persistent leads, authentication, live email delivery, reply handling or billing are connected.
- Friendly (1–7 overdue days) and direct (8–30 days) decisions now generate different preview subjects and bodies. Blocked decisions do not produce a preview.
- No measured customer-demand or revenue evidence exists.

## Latest integration — 2026-10-05

[PR #1 — stage-specific reminder previews](https://github.com/RodrigoCalleia/cobro-agent/pull/1) was merged into `main` at `3a659f41e213a06dd31d9263da18a12a2ae24ad3`.

- The merged product/test blobs match the previously tested PR head: 27 Node tests passed before integration, and independent QA re-executed all 27 test functions in V8 during integration review.
- GitHub had no hosted checks, statuses or reviews; do not describe this as CI-verified.
- The workboard-only commit that landed on `main` after the PR branch was created was preserved.
- Browser/mobile verification is still pending because no working browser runtime was available. No visual pass is claimed.
- [Integration report](https://github.com/RodrigoCalleia/cobro-agent/blob/main/docs/reports/2026-10-05-integration-review.md) records evidence, limitations and handoff.
- Next coordinator action: verify the integrated browser flow, then resolve authorized commercial hosting and persistent pilot-interest capture. Keep external delivery, subscriptions and deployment blocked until their own prerequisites are verified.

## Working roles

- Coordinator: select the next useful task, integrate bounded work, check evidence and report.
- Engineering: implement a small task in isolation.
- QA: independently check behavior, edge cases and claims.
- Market/infrastructure research: resolve a named uncertainty from current primary sources; do not invent customer evidence.

Subagents are task-scoped, not continuously running. Use only available capabilities and avoid parallel writes to the same path. One scheduled coordinator owns each work cycle.

## Ordered backlog

1. Completed 2026-10-05: reminder preview text now matches friendly/direct stages and has targeted checks. Delivery remains separate and unimplemented.
2. Select lawful commercial hosting with minimal fixed cost; document verified terms, access and deployment blockers. No paid subscription without account authorization.
3. Define an honest pilot offer and build persistent interest capture. Enable a success message only after confirmed storage. Do not expose customer data in this public repository.
4. Publish and verify mobile/desktop flow once a suitable host and access exist.
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
