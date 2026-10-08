# Append-only contact membership — 2026-10-08

## Decision

Netlify's current documentation states that overlapping writes to one Blob key are last-write-wins and that Blobs has no general concurrency-control mechanism. It recommends a more advanced database for requirements involving concurrency control. The previous shared-array contact index therefore must not be connected to Netlify Blobs.

The isolated PR #7 module now uses one immutable membership key per association: `derived-token/request-id`. Two contacts for the same normalized identity can be added simultaneously because they target distinct keys. Duplicate addition targets the same key and relies on a create-only adapter. Discovery uses the exact `derived-token/` prefix.

Netlify documents atomic conditional writes through `onlyIfNew`, prefix-filtered listing, automatic pagination by default and hierarchical keys with a trailing slash. The product module remains provider-neutral and disconnected.

## Implementation

- Replaced shared `update(token, updater)` with injected `putIfNew(key)` and `listByPrefix(prefix)` contracts.
- The derived token remains internal and is no longer returned from add/find results.
- Strictly validates normalized contact, token shape, UUID v4 membership suffix, provider response shape, duplicates and result limits.
- Added distinct-contact isolation coverage alongside simultaneous-ID and duplicate membership cases.
- Code comments require adapters to normalize the installed SDK's richer write/list response shapes.

## Verification

- Focused contact-index tests: **7/7** passed.
- Focused index plus installed-SDK runtime tests: **32/32** passed.
- Final complete local suite: **217/217** passed.
- Static build passed and produced exactly two public demo assets.
- An earlier complete run produced two timing failures in unchanged storage-deadline tests under load. Their focused rerun passed, followed by the clean final full run; no product assertion was weakened.
- Independent audit found no blocker for the pure preparation module and confirmed the separate-key layout avoids the earlier lost-update race.

## Remaining blockers

This does not yet prove a Netlify integration. The installed SDK returns a richer `{modified, etag}` write result and `{blobs, directories}` list result, so a normalized adapter and actual SDK transport tests are required. Token-secret version history must preserve lookup after rotation. Memberships are pseudonymous personal data and need retention/tombstone rules. The caller must bind contact and request ID from one trusted validated record. Listing needs a provider-fetch/resource cap, not only a post-fetch processing cap.

The public handler and form remain unavailable. No provider store, live record, contact, email, payment or customer activity was created.

## Ledger

- Spend: **USD 0**.
- Revenue: **USD 0**.
- Leads/customers captured: **0**.

## Next bounded action

Implement a disconnected adapter around the pinned SDK that normalizes `setJSON(..., {onlyIfNew: true})` and complete prefix listing, then test its in-process transport. Do not activate capture or create provider data.
