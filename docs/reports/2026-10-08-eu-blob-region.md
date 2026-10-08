# Explicit EU Blob storage region — 2026-10-08

## Outcome

Product commit [41774a4](https://github.com/RodrigoCalleia/cobro-agent/commit/41774a4740193745b9463c0deed3ba128c7931ee) on open PR #7 fixes the prepared Netlify Blob stores to `eu-central-1` instead of relying on the provider default. Contact capture remains unconditionally unavailable.

- The only product `getStore` opener now passes the same explicit region for test and production together with strong consistency.
- The actual pinned `@netlify/blobs` 11.1.1 SDK was exercised against an in-process transport; a direct API test confirms that it routes `region=eu-central-1`.
- Store names remain fixed and environment-separated. Create, read, suppression and test-only fixture cleanup reuse the same configured opener.
- No provider data was written, moved or deleted. There is no migration to claim because no live pilot-interest record has been created.

Netlify's current documentation states that a site-wide store opened without a region defaults to `us-east-2` and that every opener must use the same region. The AAIP lists European Union and European Economic Area member states as jurisdictions with adequate protection. Selecting Frankfurt therefore removes an accidental default-US storage location; it does not by itself establish complete transfer compliance.

## Verification

- Complete local suite: **210/210** Node tests passed.
- Static build passed and produced exactly the two public demo assets.
- Regression coverage checks both environment stores, strong consistency, the fixed region and the region query sent by the installed SDK.
- Independent review found no blocker for the inactive commit and confirmed the wrapper preserves the region option.
- Commit comparison contains only `docs/INTEREST_STORAGE.md`, the store opener and its two test files.

## Limits and activation blockers

Netlify Functions documentation gives `cmh` (Ohio) as the default execution region and documents custom function regions for Pro and Enterprise plans. No upgrade, subscription or account setting was changed. Consequently this work does **not** prove European-only processing, provider acceptance, legal compliance or zero future hosting cost.

Before any activation, the project still needs the accountable identity and public privacy channel, approved notice/display binding, registration and transfer decisions, applicable contract/subprocessor/log/support review, authenticated operator access, retention and rights workflow, abuse controls, and an authorized synthetic write/read/suppress acceptance against the real provider. The public form and function remain unavailable.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Prepare a privacy-preserving private contact index that can find every synthetic request ID for one normalized contact without placing the email in keys or logs. Extend suppression and rectification tests across multiple IDs, using this fixed Blob region. Do not activate capture or change hosting plans.
