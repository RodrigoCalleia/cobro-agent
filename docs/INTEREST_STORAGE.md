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

`server/pilot-interest-store.cjs` accepts an injected `getStore` implementation. No SDK package is installed by this change, no function is deployed and no SDK compatibility/integration test is claimed.

Server code selects `production` or `test` and opens the fixed corresponding namespace with strong consistency. All other contexts, including previews, are rejected before opening storage. A future route must derive this context from trusted Netlify runtime configuration, never browser input. A namespace is not a separate account/access-control boundary: authorized site code can still open other stores.

`create(record)` revalidates the contact fields and accepts only an opaque UUID v4, canonical received-at timestamp and bounded notice-version identifier alongside them. The calling server must generate the identifier/timestamp and verify association with the exact notice the user saw. Adapter syntax checks do not prove those values were generated correctly or that a notice is approved.

Create uses `onlyIfNew` and confirms only after a strong JSON read exactly matches the normalized record. Repeating the same record/ID does not overwrite it or increment a created count. A changed record under the same ID returns conflict. Read/write failures or missing reads never return stored-confirmed; raw provider errors/contact data are not included in create/delete results.

`read(id)` is private operator functionality and returns sensitive data to its trusted caller. Do not expose it as a public read endpoint. Keys contain opaque identifiers, never email addresses. `delete(id)` reports confirmation only after a strong read returns null.

## Still required before activation

- Install and pin the official SDK, verify its actual conditional-write return contract and connect the adapter from an authorized server function.
- Complete the approved notice, responsible party and public withdrawal/deletion contact channel. No private account email is adopted as a public contact.
- Generate trusted metadata and preserve the displayed notice association.
- Implement request-size/rate limits, route authentication for operator actions and client-safe timeouts/errors.
- Implement retry identity plus unique-business/request deduplication: current same-ID protection does not deduplicate different IDs.
- Implement retention and verify deletion; the 90-day maximum remains a proposal.
- Exercise a deployed synthetic request with a reserved-domain email, independently inspect the matching private record, delete it and verify absence. Keep contacts out of public reports/screenshots.
- Complete real mobile/desktop form checks. A mocked storage test is not provider acceptance evidence.

No real contact input or stored-success message should be exposed before the activation gates in docs/PILOT.md pass.

## SDK and disabled route preparation — 2026-10-06

The official `@netlify/blobs` package is now pinned to 11.1.1 in package.json and package-lock.json; all resolved dependencies have integrity hashes. Node 24.x is selected for the build. The initial injected adapter remains intact. `server/netlify-interest-store.cjs` lazily connects it to the installed SDK only for trusted Netlify Context identifying the current published production deploy of cobro-agent-rodrigo. It rejects unknown, preview, unpublished and wrong-site contexts before importing the SDK. This guard expects platform-supplied server metadata, not a reconstructed request object; it is not operator authentication. SDK credentials remain runtime-managed and are not committed.

The pinned SDK's inspected conditional setJSON implementation treats any response except 412 as modified. The integration wraps its transport so a PUT response other than 200 or 412 throws before that implementation can report success. Actual SDK tests prove matching strong reads, create-only retries, conflicts and deletion with an in-process transport; they also prove unexpected PUT responses never confirm success even if a matching record already exists. This is compatibility evidence, not live provider persistence.

`netlify/functions/pilot-interest.mjs` is the deployed entry candidate. It always returns HTTP 503 and `state: unavailable`, without reading request/context, loading the SDK, accessing records or scheduling work. It exposes no read/delete actions and has no activation environment flag. No form or client call is added. Activation requires a reviewed code change after the capture gates.

77 local tests passed, including 12 runtime/SDK cases; independent QA reran all 77. The real provider write/read/delete test, HTTP function execution and actual function runtime/credential wiring still require separate evidence. SDK retries currently allow five 5-second delays; add a bounded deadline/AbortSignal before activation. Body/rate controls, trusted notice/metadata binding, deduplication across IDs, authenticated inspection/deletion, retention and privacy/contact gates remain unfinished.

Sources checked 2026-10-06:
- https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- https://docs.netlify.com/build/functions/api/
- https://docs.netlify.com/build/functions/get-started/
- https://docs.netlify.com/build/configure-builds/manage-dependencies/
- https://github.com/netlify/primitives/issues/741 (corroborated by inspection of the installed 11.1.1 code).
