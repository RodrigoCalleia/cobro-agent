# Origin/method preflight preparation — 2026-10-07

## Completed
Continued [PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) in its existing isolated branch. Starting source heads: main `cb8791e0ff24606be2035d51e8716cd08677ae79`, branch `dd5d14570a38d27e24a541a142399aa098116347`. Fresh connector snapshots and 29 Git blob hashes were checked before editing; no prior temporary project state was used as source.

[Product commit a8c3ce3c99aeadb189f3019370415999a59cc265](https://github.com/RodrigoCalleia/cobro-agent/commit/a8c3ce3c99aeadb189f3019370415999a59cc265) adds an unused same-origin POST preflight and synthetic tests. Trusted configuration snapshots one canonical HTTPS origin. Actual native method and normalized Origin are checked before body consumption; missing/multiple/preview origins, method overrides and forwarded-header substitutions fail. No body, SDK/storage call, contact log or network call is performed by the helper itself.

[Preflight guide](../PREFLIGHT.md) records future composition and exact limits. Origin is forgeable by non-browser clients and is not authentication or abuse prevention. Native brand checks may invoke Proxy prototype traps; this is not a sandbox for arbitrary JavaScript. Future composition requires the unmodified platform-supplied native Request.

## Verification
- Node 24.19.0: 14/14 targeted tests, 155/155 full tests and static build passed after the review-driven correction.
- Independent QA ran 21 adversarial probes without a functional defect for this unused-helper scope. It found an overly broad Proxy-side-effect claim; comment/docs were narrowed and a regression case added. QA did not rerun the full suite; the coordinator ran the final 155 tests.
- Static output remains two byte-identical demo assets. Public function, existing server modules, SDK lockfile and netlify.toml are unchanged by this cycle. Handler Git blob remains `cadcebef2956b0f0da59529f7a51bbdf85868701`.
- Exact product commit has successful GitHub Netlify deploy-preview status at https://deploy-preview-7--cobro-agent-rodrigo.netlify.app . Hosted test logs, preflight/handler execution and private provider acceptance are not inferred from that status.
- Public handler remains unconditional 503; preflight is not imported or activated. No native rate rule, form, lead, email, real invoice, billing or demand evidence was created.

## Blocker and next step
PR #7 remains open pending authenticated hosted 503 verification. Existing team-protection access blocker was not re-probed without new access evidence and protection was preserved. Capture also still requires responsible-party/contact facts, approved notice/display proof, private operator access, retry secret provisioning, rate enforcement, retention/deletion and synthetic provider write/read/delete confirmation.

Next useful independent implementation: compose the prepared validation/retry/metadata/storage sequence in a server-only testable orchestrator, while retaining the public disabled handler and using only injected synthetic storage in tests. No activation or provider-write claim should accompany that preparation. Then complete the hosting/privacy gates before exposing contact fields.

Commercial sequence stays: qualified interest and explicit acceptance of the proposed US$29/30-day pilot; target three distinct qualified businesses accepting scope/price before expansion. That is a decision target, not observed customers. Payment account, seller identity/invoicing and authorized live operation remain prerequisites before a paid pilot.

## Accounting
Verified recorded spend: USD 0. Verified recorded revenue: USD 0. No expenditure, account creation, subscription or external message in this cycle.
