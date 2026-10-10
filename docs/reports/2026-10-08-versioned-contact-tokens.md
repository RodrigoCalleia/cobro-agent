# Versioned HMAC contact tokens — 2026-10-08

## Outcome

Prepared a disconnected, rotation-compatible HMAC-SHA256 token derivation for the private contact index. New memberships use only the active key version; lookup can search the active version plus at most two previous versions. No public route imports this preparation, so capture remains unavailable.

## Implementation

- Added `server/pilot-contact-token.cjs` with an explicit domain, unique bounded key versions and secrets of 32–128 bytes copied into private Node.js `KeyObject` instances.
- The key version participates in the HMAC input. Output is exactly 64 lowercase hexadecimal characters; versions and secrets are never returned.
- The index writes only the active token and performs ordered lookup across active and previous tokens.
- Repeated request IDs across different versions are deduplicated, while duplicate keys inside one version fail closed.
- One global processing budget applies across all version prefixes; any failed previous-version lookup prevents a partial result.
- Contact normalization now rejects C0/C1 controls before token derivation. The Netlify adapter also accepts only exact 64-character tokens.

## Verification

- Final focused token/index/adapter suite: **21/21** passed.
- Complete local suite: **231/231** passed.
- Static build passed and produced exactly two public demo assets.
- A fixed HMAC vector locks SHA-256, the domain and version framing.
- Tests cover three-version ordering, active-only writes, cross-version lookup/deduplication, same-version duplicate rejection, total processing limits, short-token rejection, control characters, caller-secret copying and partial-result prevention.
- Independent post-correction review approved the disconnected preparation, verified the four hardening changes and confirmed that no public handler imports these modules. Its focused run passed **19/19** before the last two additional edge-case tests.

No real secret, network request, provider record, contact, invoice, email, payment or customer activity was used.

## Remaining blockers

Activation still requires an approved server-side secret-loading mechanism, a documented rotation/retention policy, trusted binding to validated stored records, generic public error mapping and synthetic provider acceptance. Version labels must never be reused. A previous key cannot be retired until its memberships have expired under the retention policy or have been safely migrated; otherwise those associations become unreachable. Existing legal/privacy and provider gates remain unchanged.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Prepare a disconnected composition test that joins the keyring, contact index and Netlify adapter for multi-ID lookup and suppression planning, using only synthetic secrets and transport. Keep capture unavailable.
