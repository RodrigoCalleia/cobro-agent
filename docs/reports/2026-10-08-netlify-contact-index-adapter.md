# Netlify contact-index SDK adapter — 2026-10-08

## Outcome

Added a disconnected adapter between the append-only private contact index and the pinned `@netlify/blobs` 11.1.1 SDK. The public function does not import it, so capture remains unavailable.

## Implementation

- Fixed environment-separated store names: `cobro-pilot-contact-index-test-v1` and `cobro-pilot-contact-index-production-v1`.
- Opens every store with strong consistency and explicit `eu-central-1` region.
- `putIfNew` validates an opaque `token/requestId` membership, writes a minimal `{state: "member"}` marker with `onlyIfNew`, and normalizes the SDK result to exactly `{modified: boolean}`.
- `listByPrefix` requires an opaque trailing-slash token prefix, manually consumes SDK pages, strips only the private `members/` namespace, and stops when the configured processing limit is exceeded.
- No email, business name, notice text or token is returned by the adapter.

## Verification

- Focused index/adapter tests: **10/10** passed.
- Complete local suite: **220/220** passed after the change.
- Static build passed and produced exactly two public demo assets.
- Installed SDK transport test uses synthetic credentials and an in-process fetch. It verifies:
  - initial HTTP 200 create normalizes to `modified: true`;
  - duplicate HTTP 412 normalizes to `modified: false`;
  - `If-None-Match: *` is present on both writes;
  - a two-page prefix list follows `next_cursor` and returns both IDs;
  - every request uses the isolated contact-index store and `eu-central-1` path.
- Independent review ran the focused tests and a separate ad hoc SDK check, then found no blocker for disconnected preparation. Its recommended 412 and pagination scenarios are now permanent tests.

No real network, provider store, contact, invoice, email, payment or customer activity was used.

## Remaining blockers

The adapter is not wired to capture. Before any activation, the project still needs keyed/versioned HMAC derivation, secret storage and rotation-compatible lookup, retention/tombstone policy, trusted binding of contact and request ID from the same validated record, and generic public error mapping that never exposes tokens or storage paths. Legal/privacy and provider-acceptance gates remain unchanged.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Prepare versioned HMAC token derivation and rotation-compatible synthetic lookup without introducing credentials or connecting the public route.
