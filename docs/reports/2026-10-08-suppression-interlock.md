# Suppression replay interlock — 2026-10-08

## Outcome

Product commit [a3ca538](https://github.com/RodrigoCalleia/cobro-agent/commit/a3ca538d474e26bde20a5f207320b71bedc18ee2) on PR #7 adds an inactive request-level suppression primitive without enabling contact capture.

- `suppress(id)` overwrites the current request value with the minimal marker `{state: "suppressed"}` and requires a strong matching read before confirmation.
- A delayed or replayed create uses `onlyIfNew`, cannot replace the existing marker and never returns stored confirmation.
- Production physical deletion now returns `delete-unavailable` before provider access. Physical deletion remains available only in the test environment, so the production API cannot remove the marker and reopen the replay path.
- The Netlify SDK facade exposes suppression with the existing storage deadline. The actual pinned 11.1.1 SDK was exercised against an in-process transport; no provider record was created.
- The unused processor classifies `suppressed` conservatively as received-unverified rather than a false HTTP 200. A dedicated terminal response remains an activation decision.

Netlify's current documentation says normal `setJSON` overwrites an existing value, `onlyIfNew` is an atomic conditional write and strong consistency can be selected. It also warns that overlapping normal writes are last-write-wins; this implementation therefore relies specifically on the retained marker plus create-only writes, not a general locking claim.

## Verification

- Coordinator: **209/209** complete local Node tests passed, followed by the static build producing exactly two demo assets.
- Focused coordinator run: **43/43** store and SDK tests passed before the production-delete correction.
- Independent reviewer: **67/67** focused store, SDK and composition tests passed after the correction; no commit blocker found.
- Regression coverage includes suppression of an existing or absent ID, delayed create, replay, bad readback, SDK overwrite, production delete refusal and no false stored-confirmed classification.
- No native provider write, deployed function acceptance or hosted capture was performed or claimed.

## Scope limits and blockers

This prevents resurrection for one known request ID through the prepared production adapter. It does not yet locate every token/ID belonging to the same contact, implement rectification, govern direct provider/dashboard deletion, establish backup/log deletion, approve marker retention/secret rotation or authenticate an operator. These remain activation blockers alongside the responsible party, privacy channel, notice, registration/transfer decision and synthetic private provider acceptance.

PR #7 stays open and the public handler stays unconditionally unavailable.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Design a private contact index that can locate every record for one normalized contact without placing the email in keys or logs, then test suppression and rectification across multiple synthetic IDs. Do not activate a public route until the legal and provider gates pass.
