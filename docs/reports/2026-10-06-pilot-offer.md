# Pilot offer and capture contract — 2026-10-06

## Result

Read current main `61b800f0c4c0605f13c1f6d7a7218e64f3eff3bf`, the workboard, current product/build/tests and the two latest integration/hosting reports through connected GitHub. The repository had no open PR or AGENTS.md. Chose the board's next bounded task while authenticated Netlify deployment access remains unresolved.

Prepared an isolated change:
- Visible “Piloto en preparación” proposal for small B2B agencies and consultancies.
- Proposed 30-day, one-business, up-to-50-outstanding-invoice pilot at US$29, explicitly labelled an unvalidated scope/price hypothesis and unavailable service.
- CTA links only to the existing fictional-data simulation. No signup, reservation, contact collection or checkout.
- `docs/PILOT.md`: qualification/validation sequence, future capture fields, trusted validation boundary, permission/notice association, private storage, duplicate/error states, retention proposal and storage-confirmation acceptance gates.
- README points to the proposal and makes its unavailable status explicit.

The price is proposed product pricing, not a financial transaction or demand result. The proposed validation threshold is a target, not an achieved metric. Operational invoice follow-up, email, billing, storage and deployment remain absent.

## Verification

- `node --test tests/*.test.cjs`: 34 passed, zero failed.
- `node scripts/build-static.cjs`: passed; output contains only index.html and cobro-engine.js, matching their source bytes.
- HTML parser check: unique IDs, valid `#demo` CTA target, existing invoice simulation form only, no email contact input, mailto, provider form hook or fetch-based capture.
- Inline product JavaScript compiles with Node vm; script content is unchanged.
- Netlify TOML parsed; configured publish path remains dist.
- No reminder engine, build script, tests or hosting configuration change is included.
- Browser/mobile visual verification is still pending. This cycle did not repeat the previously unavailable browser-runtime probe; structural checks are not a visual pass.

## Independent review

Task-scoped QA independently read the current GitHub state, reviewed the proposal and capture gates, and checked the final local files. The review called for an explicit future-offer label, simulation-only CTA, no apparent enrollment and storage-backed confirmation. These requirements are included. Independent QA reran all 34 Node tests, checked current build output, verified the simulation-only CTA and unchanged inline JavaScript, and found no remaining blocking issue. The unchanged engine/build/test/config files are excluded from the commit.

## Blockers and next action

No authenticated authorized Netlify session is available in this work cycle; account plan confirmation and deployment remain pending. No new account, subscription, outreach, real invoice or external notification was used.

Next: publish the prepared demo when hosting access exists, verify mobile/desktop behavior, then implement private capture after responsible-party/contact/notice details, trusted validation and provider capabilities are resolved. Do not accept a live paid pilot until data isolation, authorized email, response suppression, privacy and payment prerequisites are verified.

Creating this proposal is not lead capture or customer validation. No new customer, purchase or revenue evidence was produced.

## Integration closure

[PR #3](https://github.com/RodrigoCalleia/cobro-agent/pull/3) was merged at `69066b740390b44e2c4569034762b85ab5ee3c2a`. All five remote files matched the verified local contents, main remained at the inspected base, and GitHub reported a clean merge. Integration used an expected-head guard. The five files were fetched from main after merge and matched again. No deployment or capture activation followed.
