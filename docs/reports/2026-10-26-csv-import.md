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
- Full Node suite: 296/296 passed after installing the declared dependency set with `npm install --ignore-scripts --no-audit --no-fund`
- Static build: passed; exactly two demo assets produced in `dist`

## Limits and next step

The PR is still open and draft. Manual mobile/desktop visual verification remains pending. Do not describe CSV import as integrated or deployed to production until those checks pass and the PR is merged.

Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Visual verification attempt — 2026-10-26

- The requested public preview URL was opened read-only, but Netlify Team Protection redirected it to a sign-in wall ("This site is private"). No preview UI could be inspected from this session.
- The existing public production URL remained reachable and showed the older `Cobro · prototipo` experience; it does not contain the PR #14 CSV control. This is expected because PR #14 is not merged or deployed, and is not evidence of a failed CSV implementation.
- Desktop/mobile visual acceptance therefore remains **not verified**. Do not merge or call the feature integrated/deployed until an authorized preview session is available and both viewport checks pass.
- No login was attempted, no settings were changed, and no external message or spend occurred.


## Follow-up hardening — 2026-10-26

- Improved the local parser to accept quoted CSV fields and preserve commas inside quoted values.
- Added an inline format hint next to the import control.
- Change commit: `06265c3f5094e7fd35f6dcd1e1caad2bf6e7bd6a`.
- This remains browser-local and does not alter contact, persistence, messaging, payment or backend scope.
- The full suite and static build should be rerun from this exact head before merge; visual desktop/mobile acceptance remains blocked by Netlify Team Protection.


## Verification after hardening — 2026-10-26

- Exact branch head tested: `ad2f2fc55aff8e6535500f9146a2dc7e86f53ae7`.
- First full-suite run had one intermittent failure in the existing Netlify contact-rights runtime test; the static build passed.
- Immediate repeat on the same head passed **296/296** tests.
- This confirms no reproducible regression from the CSV parser hardening, but the test remains timing-sensitive and should be watched in CI/merge review.
