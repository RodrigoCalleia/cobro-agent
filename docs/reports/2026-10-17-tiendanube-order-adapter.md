# Tiendanube synthetic order adapter — 2026-10-17

## Delivered
- Added a pure, read-only adapter for a bounded Tiendanube/Nuvemshop order page.
- Normalizes only order identity, store binding, status, amount/currency, timestamps and a one-way customer reference.
- Rejects duplicate IDs, malformed money/status/date values, provider-external pagination URLs and pages over 100 orders.
- No OAuth, network call, webhook, message, storage write, billing or production route is connected.

## Verification
- Focused adapter tests: 7/7 expected cases.
- This change is prepared through the existing private integration branch and remains synthetic only.
- Full repository suite was not run in this API-only cycle; it must run from an exact clone before merge.

## Accounting and blockers
- Spend USD 0; revenue USD 0; verified leads/customers 0.
- Still blocked on developer/Partner Portal access, real OAuth installation, privacy/support/contact material, demo store and homologation. Keep PR #12 draft.
