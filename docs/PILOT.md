# Pilot proposal and interest-capture contract

Decision date: 2026-10-06. This is a coordinator-selected experiment, not an active offer, measured demand or legal approval.

## Commercial hypothesis

Start with small B2B agencies and consultancies in Argentina that manually review outstanding invoices and write follow-up emails. Test whether a clearer review queue and prepared reminders are useful enough to buy. Do not claim recovered revenue or reduced workload before measuring them.

Proposed first paid pilot: 30 days, one business, up to 50 outstanding invoices, US$29 total. This is a price/scope hypothesis, not a current subscription, checkout or customer commitment. Local currency, invoicing/tax treatment and payment terms must be resolved before any sale; this document does not establish them. No automatic renewal is proposed for the pilot.

The future pilot would provide an authenticated review queue, reminders approved by the business before sending, and suppression after payment, dispute, active payment promise or recent contact. This requires company isolation, durable data, sender authorization, response handling and a payment account. It is not implemented by the current demo. No collection agency service, legal action or recovery guarantee is offered.

## Available today

The demo has fictional invoices, deterministic prioritization, reminder previews, simulated payment and decision export. It uses a fixed simulation date and in-memory state. It does not register interest, send emails, persist records or accept money. No AI model is connected.

The visible proposal links only to the existing simulation. There is no contact form, signup, reservation, trial activation or checkout. Hosting publication is complete at https://cobro-agent-rodrigo.netlify.app/ on Netlify Free. The desktop simulation was verified; mobile and separate anonymous-session checks remain pending.

## Validation sequence

1. Publish the fictional-data demo on an authorized commercial host and verify the mobile/desktop flow.
2. Activate private interest capture only after the gates below. Obtain separate authorization before sending any outreach.
3. Test the problem and proposed US$29 pilot price with interested businesses: what they do today, which reminders they pause, and whether they would purchase at that price. A request for information is not a purchase commitment.
4. Record counts from observed private records only: unique requests, qualified businesses, explicit price acceptance and actual payments as separate stages. Duplicate submissions, test records and casual demo visits are not new leads.
5. Proposed decision threshold: three distinct qualified businesses explicitly accept the price/scope before building beyond the operational prerequisites. This is a future target, not evidence that any have accepted. If they reject it, revise the hypothesis using their reasons.

Qualification means a B2B agency/consultancy with a recurring manual invoice-follow-up problem and a representative able to evaluate a purchase. Ask about workflow without requesting real invoices or debtor information during this phase. Do not begin a live paid pilot until operational, payment and privacy prerequisites are complete.

## Minimum future capture contract

Purpose: request information about the proposed pilot. No automatic marketing-list enrolment, account creation, payment or promise of service availability.

Collect only:
- `contact_email`: required business contact address; maximum 254 characters; trim surrounding whitespace, reject newlines/control characters and apply basic syntax checks. Syntax is not proof of address ownership.
- `business_name`: optional, maximum 100 characters; treat as literal text.
- `contact_permission`: required affirmative permission for a response about this pilot, with the exact notice version recorded.

Exclude attachments, real invoices, debtor/client names, balances, credentials and free-text financial details. Reject fields outside the allowlist at a trusted validation boundary before storing them. Client-side validation alone is insufficient.

Generate private metadata at the trusted boundary: record/request identifier, received-at timestamp, notice version and contact-permission value. Do not trust a browser-supplied timestamp as proof. Ensure permission can be associated with the exact submitted notice. Netlify Forms is only a candidate: if it cannot enforce required validation or private metadata, use a verified server-side boundary before activation.

Access is limited to the authorized operator/coordinator through authenticated tools; records must never be committed to this public repository, issues, PRs or public QA screenshots. No automatic notification or reply is enabled by this contract.

## Activation gates

Before exposing contact inputs:
- Authenticated hosting access, actual plan confirmation and a real deployed URL.
- Private submission storage and an authenticated way to inspect it.
- Identified responsible party, contact/withdrawal/deletion channel, approved privacy notice and disclosure of hosting/storage providers. These are unresolved; do not fill them with invented identity details or claim legal compliance.
- Retention decision: proposed maximum 90 days for inactive requests, sooner on withdrawal; this is a proposal until deletion is implemented and verified.
- Trusted validation, permission-version recording, abuse/rate controls and safe duplicate/retry behavior.
- Mobile/desktop checks of the real deployed form, plus the storage check below.

Capture can precede live invoice operation, but it must not claim that buying or onboarding is available.

## Storage acceptance and UI states

A form is not operational until a uniquely tagged synthetic request sent through the deployed page produces a matching record in private provider storage and an independent authenticated read confirms it. Use a reserved test-domain email and fictional business name only. Check spam/quarantine where applicable, then delete the synthetic record and verify deletion. Keep public evidence to redacted identifiers/results; never publish submitted contact data.

Exercise:
- Valid request: exact allowed fields and notice/permission version arrive at storage.
- Invalid email, overlong values, control characters, extra fields or missing permission: rejected at the trusted boundary; no stored accepted request.
- Duplicate and repeated submission: preserve one logical request; never inflate the unique-request count.
- Timeout, network failure, retry and provider rejection: no false saved-success, no lost notice/permission association, and no duplicate logical request.
- Storage inaccessible or receipt unverified: remain unverified even after HTTP 2xx or a redirect.

UI states: editing; submitting; rejected; failed; received-unverified; stored-confirmed. Only use a saved/registered claim where the application's trusted confirmation is backed by storage. If the provider cannot support per-request confirmation, show “Envío realizado; recepción aún no confirmada” and track the record independently, without a saved-success claim. A verified setup test does not turn every later successful HTTP response into proof of persistence.

## Next bounded implementation

The demo is published. `server/validate-pilot-interest.cjs` provides dependency-free request validation for a future trusted server boundary; it is not deployed as an endpoint and does not store requests. It only accepts the three allowed fields, requires boolean permission, and rejects control characters, malformed or oversized fields and client-supplied metadata. Email syntax checks are conservative ASCII checks, not ownership verification. Business names remain literal text and must be rendered using safe text APIs.

Resolve the capture activation gates and provider capabilities, then connect these prepared modules to the smallest trusted capture flow. Server-generated timestamp, server-configured notice version and stable HMAC-derived retry identity now exist behind the disabled route. Approved notice content, proof that the deployed page rendered the matching version, private persistence, route/browser composition, unique-business measurement, rate controls, retention/deletion and end-to-end confirmation still require implementation and verification. Keep interest capture and live invoice operation as separate milestones.

### Bounded body-reader preparation — 2026-10-07

Open PR #7 now additionally prepares `server/read-pilot-interest.cjs`: fixed 4096-byte streamed input cap, two-second per-invocation read/parse budget, strict JSON/UTF-8 envelope, repeated decoded-key rejection and existing field validation. It remains unused by the unconditional disabled public function. [Request-boundary guide](REQUEST_BOUNDARY.md) records exact behavior and limits, including pending submission deduplication, rate controls, trusted notice/metadata binding and real hosted/provider acceptance. This is not activated capture or demand evidence.

### Trusted metadata preparation — 2026-10-07

Open PR #7 also prepares `server/prepare-pilot-interest-record.cjs`: the future trusted server boundary must supply a bounded notice version, while cryptographic UUID and canonical received-at time default to server generation. Client metadata and extra fields are rejected. [Metadata-binding guide](METADATA_BINDING.md) records the future integration order and remaining limits. No approved notice, rendered-version proof, form, provider record or lead is created.

### Same-origin preflight preparation — 2026-10-07

Open PR #7 additionally prepares `server/pilot-interest-preflight.cjs`: POST plus a single trusted canonical HTTPS Origin are checked before body consumption. [Preflight guide](PREFLIGHT.md) records the exact behavior and future ordering. Origin is not authentication and can be forged by non-browser clients. The helper remains unused; browser/route integration, native rate enforcement, privacy/notice gates and real storage acceptance are pending.

### Retry identity preparation — 2026-10-07

Open PR #7 now prepares `server/pilot-interest-retry-id.cjs`: a canonical random client token is converted with a runtime-only HMAC secret into a stable opaque server UUID. A later retry with the same identity and logical fields confirms the original stored record and timestamp; changed contact, business, permission or notice remains a conflict. [Retry-identity guide](RETRY_IDENTITY.md) records the protocol and rotation boundary. Route/header integration, secret provisioning, browser token lifecycle, rate controls and unique-business deduplication remain pending; capture is still disabled.


## Storage integration preparation — 2026-10-06

Netlify Blobs is selected as the candidate within the existing account. [Storage integration](INTEREST_STORAGE.md) records current official evidence, authenticated empty-state inspection and the prepared server-only adapter. Same-ID create-only writes, matching strong reads and deletion confirmation are tested with an injected in-memory provider. No SDK, endpoint or live storage was activated; private provider write/read/delete remains unverified. This does not complete the capture activation gates or count as customer demand.

## Abuse policy preparation — 2026-10-07

[ABUSE_CONTROLS.md](ABUSE_CONTROLS.md) selects a future native rule of five requests per 60 seconds per domain/IP, an early same-origin/method boundary, bounded client retry behavior and a hosted acceptance matrix. It is documentation only; no rule or route is configured by this cycle. Native enforcement can lag and has no global Free-plan quota; accepted post-processing logs, alias coverage and bounded synthetic throttling checks are required before any activation. The existing 4096-byte application reader and storage deadlines remain separate controls. Browser preflight, operator/retention, approved notice, stable secret and provider acceptance are still pending.
