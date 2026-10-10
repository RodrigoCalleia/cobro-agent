# Follow-up simulation port to current main — 2026-10-10

## Result

Reconciled draft PR #8 with current `main` through a two-parent merge candidate. The current Rondacobro identity, hero, pilot, metrics and workspace remain the base; only the fictional follow-up editor and its accessibility affordances were ported.

## Product delta

- Unpaid fictional invoices can open `Simular seguimiento`.
- A dispute, payment promise or last-contact date can be changed or cleared.
- The same invoice is recalculated without changing its identity, amount or due date.
- Paid invoices remain protected.
- Save returns focus to the same invoice action and announces a simulation-only status.
- Controls have 44px minimum height; the horizontal invoice region is named, keyboard-focusable and uses the current blue focus token.

All state remains in memory. No message, payment, contact capture, provider write, storage, repair route or scheduler is connected.

## Reconciliation safety

- Merge parents: PR #8 head `f54c87c` and current `main` `6246bd4`.
- The only textual merge conflict was `index.html`.
- Resolution preserves the current Rondacobro page and ports the minimum functional delta instead of restoring the old Cobro page.
- Recent server, privacy, deployment and audit work from `main` is preserved.

## Verification

- Complete Node suite: **309/309 passed**.
- Static build: **passed**, exactly two public demo assets.
- Independent review defined the minimum port and ran **9/9** synthetic helper probes.
- The mobile source regression was adapted to the current blue focus token rather than the obsolete green rule.

Native mobile/touch and hosted preview acceptance remain pending. PR #8 must remain draft and its preview must not be promoted to production.

## Accounting

- Spend: **USD 0**
- Revenue: **USD 0**
- Verified leads/customers: **0**

## Next

Publish only the PR preview, verify desktop and narrow mobile interaction with fictional data, then decide whether the draft is ready for integration. Production recovery remains a separate blocker.
