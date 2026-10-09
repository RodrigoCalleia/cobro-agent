# Operator audit CAS adapter — 2026-10-09

## Result

Continued open PR #7 on its isolated branch and prepared a disconnected private audit adapter for the single-ID operator repair gate. The adapter stores one bounded document per operation and updates it with create-only or ETag compare-and-swap conditions, keeping operation binding, the exclusive lease and the terminal outcome inside one atomic document boundary.

The start event now carries authorization expiry. Claims last at most 60 seconds and never outlive that authorization. A live claim returns `busy`; an expired claim can be recovered under a new authorization; stale completion is rejected; terminal replay is idempotent; operation IDs cannot be rebound; retries and CAS conflicts are bounded. Reads are strong, the store name/environment and EU region are fixed, and the adapter has no list or delete method.

The event array is logically append-only at application level. Netlify Blobs is not asserted to provide WORM storage or regulatory immutability. The adapter and verified conditional-write transport remain unconnected: no route, job, identity verifier, provider data or operator action was enabled.

## Independent review

Independent design review rejected a multi-key binding/lease/event design because separate Blob writes would leave race windows. It required the single-document CAS model, authorization-expiry binding, bounded recovery/conflicts, exact readback and explicit logical-not-physical immutability. Post-implementation review then found and caused corrections for lease crossings during slow provider work, partial readback comparison, invalid stored chronology and repeated fencing tokens. Final review is recorded in the PR update.

## Verification

- Focused operator/audit tests: **27/27 passed**.
- Complete repository suite: **285/285 passed**.
- Static build passed and produced exactly the two expected demo assets.
- Import inspection found the new adapter only in its server module and focused test; no public function or browser import was added.
- Tests use only synthetic clocks, identities, authorizations and in-memory transports. No live Blob write/read/delete was attempted.

## Limits and next step

Before activation the project still needs an authenticated operator identity source, a real authorization verifier, approved retention/access policy, secrets/rate controls and provider acceptance. The next engineering step is a disconnected runtime composition with one abortable deadline spanning SDK loading, authorization, audit CAS/readback, repair and terminal persistence. It must remain unreachable from routes and schedulers.

Recorded spend **USD 0**; recorded revenue **USD 0**; verified leads/customers **0**.
