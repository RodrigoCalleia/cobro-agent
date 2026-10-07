# Rondacobro retry-identity preparation — 2026-10-07

## Source state and decision

This cycle continued open PR #7 and branch `product/disabled-interest-route-2026-10-06`; it did not start a competing product branch. The verified starting heads were branch `474d3dba654525d2e82e17da7cdcc61f7c57f4a5` and main `5fe52db2b3567d77925443d6c0d80b9f2eb4d7ed`.

The selected backlog step was safe retry identity across separate HTTP submissions. It is preparation behind the disabled route, not an active form or provider acceptance.

## Delivered

- Product commit `1dbec20f196b3afed87772d3a733f9e4793036d7` adds `server/pilot-interest-retry-id.cjs` and tests.
- A canonical random client UUID v4 is mapped through HMAC-SHA-256 with a versioned context and runtime-only secret to an opaque stable server UUID v4. The secret requires at least 32 actual bytes and is copied at configuration.
- Invalid normalized header values fail generically without reading the body or returning the token. No secret, activation flag or contact data was committed.
- Same derived ID plus the same logical contact/business/permission/notice confirms the first record when the retry timestamp is equal or later. The first timestamp is retained; earlier time, changed fields or noncanonical provider data conflict.
- `docs/RETRY_IDENTITY.md` records the future route order, secret rotation boundary and explicit difference between retry safety and unique-business deduplication.

## Verification and independent review

- Node 24.19.0 full suite: 141 passed, 0 failed.
- Targeted retry/store suite: 24 passed, 0 failed.
- Static build passed and produced only the two demo assets.
- Independent QA initially found leakable proxy/getter errors, spoofable typed-array length, provider normalization weakening and lexical timestamp ordering. All were fixed before commit.
- QA then approved the disabled preparation: 17 adversarial checks plus five extended-year timestamp cases passed. It independently confirmed the public handler byte-identical by SHA-256 and still unconditional 503.
- Netlify deploy-preview status for the exact product commit was successful (deploy `6ac636181e447b0008adf345`): https://deploy-preview-7--cobro-agent-rodrigo.netlify.app . Hosted logs and handler execution are not inferred from a green status alone.

## Limits and next step

Capture remains disabled. The browser token lifecycle, route composition, stable secret provisioning/versioning, rate controls, unique-business measurement, approved notice/display proof, retention, authenticated operator flow and real provider write/read/delete remain unfinished.

The principal integration blocker is unchanged: authenticated hosted verification of the unconditional 503 handler is not available. Do not weaken team protection or claim hosted function execution. The next independent implementation step is a bounded rate/abuse policy for the future disabled route; it can be prepared without exposing a form or provisioning a secret.

## Accounting

- Verified experiment spend: USD 0.
- Verified experiment revenue: USD 0.
- No subscription, purchase, third-party message, contact capture, real invoice or customer metric was created.
