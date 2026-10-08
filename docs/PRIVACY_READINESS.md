# Pilot-interest privacy readiness

_Status: preparation only — not legal advice, regulatory approval or a compliance claim._

This document turns the privacy blocker for the disabled pilot-interest capture into a verifiable activation checklist. It does not authorize collection, publish a notice, register a database or enable the route.

## Bounded data scope

The pilot-interest path may accept only:

- business email (required);
- business name (optional);
- an affirmative permission boolean tied to an exact notice version.

It must not request or accept invoice content, debtor/customer names, balances, tax identifiers, payment data, free text, sensitive data or attachments. A business email can still identify a person and is treated as personal data for this gate.

## Decisions and unresolved facts

| Topic | Current status | Activation rule |
|---|---|---|
| Purpose | Proposed: answer a pilot inquiry and evaluate interest in Rondacobro | Freeze one plain-language purpose; do not reuse the record for unrelated marketing |
| Fields | Confirmed bounded scope above | Server allowlist and UI must match exactly |
| Responsible party | **Unresolved** | Approve legal identity and domicile; do not infer them from a GitHub profile |
| Privacy contact | **Unresolved** | Provide a monitored public channel for rights requests |
| Storage/provider | Candidate integration exists but facts are incomplete | Verify processor contract/DPA, locations, subprocessors, access and deletion controls |
| International transfer | **Unresolved** | Identify actual destinations and document the applicable lawful mechanism before collection |
| Database registration | **Unresolved** | Obtain a documented applicability decision and register the responsible party/base if required |
| Retention | Proposed operational ceiling: 90 days, not approved and not a legal grace period | Approve a period and deletion trigger; show the same value in the notice and honor valid suppression requests separately |
| Recipients | **Unresolved until provider facts are verified** | Name or clearly describe the recipient categories actually used |
| Rights handling | Target procedure below | Test request intake, identity verification, retrieval/correction/deletion and closure evidence |

AAIP materials use both broad registration language and the phrase “bases destinadas a dar informes.” AAIP also describes that concept more broadly than selling or publishing data. Rondacobro must not assume that a small B2B prospect list, internal use or lack of data sales makes registration unnecessary. A responsible person/legal entity must resolve applicability before activation.

## Required notice content

Before any field is displayed, the notice version associated with consent must clearly state:

1. the specific purpose and intended recipients or recipient categories;
2. the existence and location/type of the database or storage;
3. the responsible party's identity and domicile;
4. which answers are required or optional;
5. the consequences of providing, refusing or providing inaccurate information;
6. how to exercise access, rectification, update and suppression rights;
7. the monitored privacy contact;
8. the retention period and deletion trigger;
9. the actual processor/provider and any international-transfer facts that apply;
10. the current mandatory AAIP informational text for complaints/claims required by Resolution AAIP 14/2018.

The server record should store only the immutable notice version needed to prove which text was presented, not a copy of unrelated page content.

## Non-publishable notice template

> **Purpose:** use your business email to answer this pilot inquiry and evaluate interest in Rondacobro. We will not use this record for unrelated marketing without a separate basis.
>
> **Data requested:** business email (required), business name (optional) and your affirmative permission. If you do not provide the required email and permission, we cannot answer the pilot inquiry. Inaccurate information may prevent a response.
>
> **Responsible party:** [RESPONSIBLE LEGAL IDENTITY PENDING], [LEGAL DOMICILE PENDING]. Privacy requests: [MONITORED PRIVACY CONTACT PENDING].
>
> **Storage and recipients:** the record will be stored in [DATABASE/PROVIDER PENDING] and processed by [PROCESSOR AND RECIPIENT CATEGORIES PENDING]. [PROCESSING LOCATIONS / INTERNATIONAL TRANSFER MECHANISM PENDING].
>
> **Retention:** [APPROVED PERIOD AND DELETION TRIGGER PENDING].
>
> **Your rights:** you may request access, rectification, update or suppression through the privacy contact above. Notice version: [IMMUTABLE VERSION PENDING].

This template is intentionally blocked from publication while any bracketed value remains.

## Rights-request operating procedure

Use the current AAIP central rights guidance as the operating deadline:

- access: respond within **10 calendar days**;
- rectification, update or suppression: act within **5 business days**.

Procedure:

1. receive the request only through the approved monitored channel;
2. verify identity proportionately without collecting unnecessary new data;
3. locate the record by normalized business email or internal identifier;
4. return, correct or delete only the relevant record;
5. confirm completion without exposing provider credentials or other records;
6. keep minimal private operational evidence of request type, timestamps and outcome;
7. cancel or invalidate in-flight work and retry identities before confirming suppression;
8. prevent a delayed write or replayed token from recreating a suppressed record;
9. locate every record for the requester even if different submission tokens were used;
10. support rectification explicitly rather than treating a create/read/delete adapter as a complete rights workflow;
11. escalate an incident or deadline risk to the accountable responsible party.

A successful delete followed by one empty read proves absence only at that moment. Suppression acceptance must also prove that delayed writes, queued work and replayed retries cannot resurrect the record. The public repository, GitHub issues, screenshots and build logs are not approved storage for submissions or rights requests.

## Cloud and international-transfer gate

AAIP identifies cloud processing as a scenario that can involve international transfer. Do not infer a country from the Netlify brand or dashboard. Before activation, record:

- the contracting processor and applicable terms/DPA;
- actual processing/storage destinations and relevant subprocessors;
- whether each destination is recognized as adequate by AAIP;
- if not adequate, the applicable exception, express-consent analysis or AAIP model contractual clauses;
- deletion/export controls and how the operator verifies them;
- processing through logs, backups, support access and any future operator/AI tooling that could read submissions.

The permission checkbox for answering a pilot inquiry does not by itself establish informed consent for an international transfer. A UUID, hash or HMAC may reduce direct exposure but remains pseudonymous when the person can still be linked; it is not treated as anonymization for this gate.

If those facts cannot be evidenced, the form remains unavailable.

## Activation checklist — all required

- [ ] Responsible legal identity and domicile approved.
- [ ] Monitored privacy contact approved and tested.
- [ ] Registration applicability documented; registrations completed if required.
- [ ] Provider contract/DPA, locations, subprocessors and transfer mechanism evidenced.
- [ ] Retention period and deletion trigger approved.
- [ ] Final notice has no placeholders, includes the current Resolution AAIP 14/2018 informational text and carries an immutable version.
- [ ] UI notice and server allowlist match the bounded fields.
- [ ] Operator access is least-privilege and private.
- [ ] Rights-request workflow is rehearsed against synthetic data, including lookup of all records for one contact and explicit rectification.
- [ ] Synthetic create, exact read, rights-style lookup and confirmed delete succeed privately.
- [ ] Suppression cancels/invalidate in-flight work and retries; delayed or replayed submissions cannot resurrect the record.
- [ ] Error/retry behavior never claims a save without confirmed storage.
- [ ] No customer, invoice, debtor or payment data is used in acceptance.

Until every item passes, keep the handler unavailable and do not count clicks, failed requests or test records as demand.

## Official sources checked 2026-10-08

- [AAIP — Obligaciones de los responsables](https://www.argentina.gob.ar/aaip/datospersonales/obligaciones)
- [AAIP — Conocé tus derechos respecto a tus datos personales](https://www.argentina.gob.ar/aaip/datospersonales/derechos)
- [AAIP — Registro Nacional de Bases de Datos Personales](https://www.argentina.gob.ar/aaip/datospersonales/registro)
- [AAIP — Transferencias internacionales](https://www.argentina.gob.ar/aaip/datospersonales/transferencias-internacionales)
- [Resolución AAIP 14/2018 — texto vigente del aviso de control](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-14-2018-307621/texto)
- [Ley 25.326](https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/actualizacion)

Source text can change. Recheck the final notice and registration/transfer decision at activation time.
