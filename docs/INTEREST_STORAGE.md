# Pilot-interest storage integration

Coordinator decision: 2026-10-06. Select Netlify Blobs + a server-side function as the candidate for the minimum capture flow in the existing Netlify account. This is an integration decision, not activation or proof of stored leads.

## Provider evidence

Official documentation checked on 2026-10-06:
- https://docs.netlify.com/build/data-and-storage/netlify-blobs/ (updated 2026-09-30).
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/

Blobs supports conditional create-only writes, JSON reads, strong consistency and deletion. Site-wide stores survive deploys and are shared across deploy contexts; separate names and a trusted runtime context gate are required. Netlify encrypts storage, but application code must prevent disclosure. The Free credit-based plan includes Blobs and has a hard monthly credit limit.

Authenticated project UI was inspected at https://app.netlify.com/projects/cobro-agent-rodrigo/blobs . It showed the empty-storage introduction, not an existing store or stored request. UI access is verified; runtime write/read/delete is not. Empty UI is not evidence that a separate activation step is required; the future SDK runtime supplies provisioning/access.

The provider documentation describes atomic conditional writes but its troubleshooting section also says there is no concurrency control. Limit the design to conditional operations on one key, not transactions; verify the pinned SDK against the real service before activation.

## Prepared adapter

`server/pilot-interest-store.cjs` accepts an injected `getStore` implementation. The original dependency-free adapter is unchanged. SDK compatibility preparation and the disabled function entry are described below; real runtime storage access remains unverified.

Server code selects `production` or `test` and opens the fixed corresponding namespace with strong consistency. All other contexts, including previews, are rejected before opening storage. A future route must derive this context from trusted Netlify runtime configuration, never browser input. A namespace is not a separate account/access-control boundary: authorized site code can still open other stores.

`create(record)` revalidates the contact fields and accepts only an opaque UUID v4, canonical received-at timestamp and bounded notice-version identifier alongside them. The calling server must generate the identifier/timestamp and verify association with the exact notice the user saw. Adapter syntax checks do not prove those values were generated correctly or that a notice is approved.

Create uses `onlyIfNew` and confirms only after a strong JSON read is already canonical and matches the logical record. Repeating an existing ID with the same contact, business, permission and notice confirms the first record when the new timestamp is equal or later; the first stored timestamp is preserved and the created count is not incremented. An earlier timestamp, noncanonical stored field or any other changed field under the same ID returns conflict. A newly created record still requires an exact readback match. Read/write failures or missing reads never return stored-confirmed; raw provider errors/contact data are not included in create/delete results.

`read(id)` is private operator functionality and returns sensitive data to its trusted caller. Do not expose it as a public read endpoint. Keys contain opaque identifiers, never email addresses. `delete(id)` reports confirmation only after a strong read returns null.

## Still required before activation

- Verify real SDK runtime/credential wiring and private write/read/delete. The package is pinned and its conditional-write transport is guarded in the preparation below; local compatibility tests do not complete provider acceptance.
- Complete the approved notice, responsible party and public withdrawal/deletion contact channel. No private account email is adopted as a public contact.
- Trusted UUID/timestamp and server-configured notice-version preparation now exist in the unused module documented by [METADATA_BINDING.md](METADATA_BINDING.md). Still approve the notice and prove the deployed page displayed the exact matching version.
- Implement request-size/rate limits, route authentication for operator actions and client-safe timeouts/errors.
- Connect the prepared retry-identity module to the future route and provision/version its runtime secret. This handles repeated use of one client token; unique-business/request deduplication across different tokens remains unresolved.
- Implement retention and verify deletion; the 90-day maximum remains a proposal.
- Exercise a deployed synthetic request with a reserved-domain email, independently inspect the matching private record, delete it and verify absence. Keep contacts out of public reports/screenshots.
- Complete real mobile/desktop form checks. A mocked storage test is not provider acceptance evidence.

No real contact input or stored-success message should be exposed before the activation gates in docs/PILOT.md pass.

## SDK and disabled route preparation — 2026-10-06

The official `@netlify/blobs` package is now pinned to 11.1.1 in package.json and package-lock.json; all resolved dependencies have integrity hashes. Node 24.x is selected for the build. The initial injected adapter remains intact. `server/netlify-interest-store.cjs` lazily connects it to the installed SDK only for trusted Netlify Context identifying the current published production deploy of cobro-agent-rodrigo. It rejects unknown, preview, unpublished and wrong-site contexts before importing the SDK. This guard expects platform-supplied server metadata, not a reconstructed request object; it is not operator authentication. SDK credentials remain runtime-managed and are not committed.

The pinned SDK's inspected conditional setJSON implementation treats any response except 412 as modified. The integration wraps its transport so a PUT response other than 200 or 412 throws before that implementation can report success. Actual SDK tests prove matching strong reads, create-only retries, conflicts and deletion with an in-process transport; they also prove unexpected PUT responses never confirm success even if a matching record already exists. This is compatibility evidence, not live provider persistence.

`netlify/functions/pilot-interest.mjs` is the deployed entry candidate. It always returns HTTP 503 and `state: unavailable`, without reading request/context, loading the SDK, accessing records or scheduling work. It exposes no read/delete actions and has no activation environment flag. No form or client call is added. Activation requires a reviewed code change after the capture gates.

The initial SDK preparation passed 77 local tests, including 12 runtime/SDK cases; independent QA reran all 77. The real provider write/read/delete test, HTTP function execution and actual function runtime/credential wiring still require separate evidence. Operation deadlines are prepared below. Server metadata generation is now prepared separately, but approved notice/display binding, body/rate controls, deduplication across IDs, authenticated inspection/deletion, retention and privacy/contact gates remain unfinished.

Sources checked 2026-10-06:
- https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- https://docs.netlify.com/build/functions/api/
- https://docs.netlify.com/build/functions/get-started/
- https://docs.netlify.com/build/configure-builds/manage-dependencies/
- https://github.com/netlify/primitives/issues/741 (corroborated by inspection of the installed 11.1.1 code).

## Storage operation deadlines — 2026-10-06

PR #7 additionally prepares a five-second budget for each private create/read/delete invocation. Trusted server code may choose an integer from 1 to 10000 ms; browser input must never control it. A fresh SDK adapter and AbortController isolate concurrent invocations. A create includes its PUT and confirming strong read in one budget; deletion includes its DELETE and absence check. Reads and response-body consumption are also covered.

The guard uses Node's monotonic performance.now(), checking before/after transport, after JSON consumption and before returning an operation result. The caller also races an expiration timer, so a transport ignoring AbortSignal cannot keep it awaiting indefinitely. On expiry, create/delete return received-unverified/delete-unverified. A private read throws a generic unverified error rather than representing a timeout as an absent record. Validation errors remain validation errors. This is a server storage-operation deadline, not a complete HTTP request deadline: SDK import, future parsing/authentication and provider-independent work require their own controls.

Signals are forwarded to fetch and aborted on expiry/completion. SDK internal retry sleeps may outlive the caller; they cannot reach another transport request after this invocation closes. Cancellation does not prove rollback: an already dispatched PUT or DELETE may have been applied by the provider. Recover with the same trusted request ID and an authenticated inspection; never claim saved/deleted success or absence from a timeout alone. JavaScript cannot guarantee a wall-clock return while its event loop is blocked, but the monotonic checks still prevent a late confirmation when execution resumes.

Local regression tests use the actual installed SDK with in-process synthetic transports, covering stalled/late PUTs, stuck JSON, private read failure, late delete confirmation, closed-budget retries, concurrent calls, timer-blocking transport/body reads and invalid deadline/record values. No real provider storage is accessed and the public handler remains unconditionally disabled. See docs/reports/2026-10-06-storage-deadline.md for current verification and hosted limitations.

Node reference checked 2026-10-06: https://nodejs.org/docs/latest-v24.x/api/perf_hooks.html#performancenow .

## Retry identity preparation — 2026-10-07

PR #7 additionally prepares a server-only HMAC mapping from a canonical client `Idempotency-Key` UUID to an opaque stable request UUID. The secret requires at least 32 runtime bytes, is copied at configuration, and is never committed or returned. Invalid tokens fail without body consumption. See [RETRY_IDENTITY.md](RETRY_IDENTITY.md).

The adapter accepts a timestamp-only difference when a conditional write reports an existing record and the strongly read logical record otherwise matches; it confirms the first timestamp and reports `created: false`. New writes still require exact confirmation. Changes to contact, business, permission or notice conflict. This does not deduplicate separate tokens, rate-limit submissions or prove a provider operation.

The full local suite contains 141 passing tests and the static build still produces only two demo assets. The public handler remains unconditional 503. Independent QA and hosted build evidence are recorded in `docs/reports/2026-10-07-retry-identity.md`.
