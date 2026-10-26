# CSV import preparation — 2026-10-26

## Scope

PR #14 adds a local CSV import affordance to the fictional invoice demo. It accepts the columns `id,client,amount,due,promise,state`, applies the existing deterministic decision validation, skips invalid rows and duplicate invoice IDs, and keeps imported data in browser memory only.

This is an MVP preparation step for the agreed CSV/Excel workflow. It does not create a server endpoint, persist data, send messages, handle real invoices, collect contacts, or process payments.

## Evidence

- Isolated branch: `product/csv-import-2026-10-26`
- PR: https://github.com/RodrigoCalleia/cobro-agent/pull/14
- Product commit: `2671dbdce3c96601cc197dc1b173bd9734fc4cb5`
- Netlify deploy preview status: successful
- Preview: https://deploy-preview-14--cobro-agent-rodrigo.netlify.app
- Embedded JavaScript syntax check: passed for both script blocks

## Limits and next step

The PR is still open and draft. Full Node suite execution and manual mobile/desktop visual verification remain pending. Do not describe CSV import as integrated or deployed to production until those checks pass and the PR is merged.

Spend: USD 0. Revenue: USD 0. Customer/contact data: none.
