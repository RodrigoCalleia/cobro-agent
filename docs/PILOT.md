# Pilot proposal and interest-capture contract

Decision date: 2026-10-06. This is a coordinator-selected experiment, not an active offer, measured demand or legal approval.

## Commercial hypothesis

Start with small B2B agencies and consultancies in Argentina that manually review outstanding invoices and write follow-up emails. Test whether a clearer review queue and prepared reminders are useful enough to buy. Do not claim recovered revenue or reduced workload before measuring them.

Proposed first paid pilot: 30 days, one business, up to 50 outstanding invoices, US$29 total. This is a price/scope hypothesis, not a current subscription, checkout or customer commitment. Local currency, invoicing/tax treatment and payment terms must be resolved before any sale; this document does not establish them. No automatic renewal is proposed for the pilot.

The future pilot would provide an authenticated review queue, reminders approved by the business before sending, and suppression after payment, dispute, active payment promise or recent contact. This requires company isolation, durable data, sender authorization, response handling and a payment account. It is not implemented by the current demo. No collection agency service, legal action or recovery guarantee is offered.

## Available today

The demo has fictional invoices, deterministic prioritization, reminder previews, simulated payment and decision export. It uses a fixed simulation date and in-memory state. It does not register interest, send emails, persist records or accept money. No AI model is connected.

The visible proposal links only to the existing simulation. There is no contact form, signup, reservation, trial activation or checkout. Hosting publication and visual verification remain pending.

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

Once authorized hosting access exists, publish the prepared demo and verify it. Resolve the capture activation gates and provider capabilities, then implement the smallest trusted capture flow. Keep interest capture and live invoice operation as separate milestones.

