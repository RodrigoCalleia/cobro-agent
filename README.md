# Cobro Agent

Interactive B2B invoice follow-up prototype using fictional data and deterministic rules.

Open index.html with cobro-engine.js in the same directory to explore invoice prioritization, reminder previews and simulated payments. Reminder text is friendly at 1–7 overdue days and direct at 8–30 days. Blocked decisions do not produce a preview.

This branch adds “Simular seguimiento” for unpaid fictional invoices: edit a dispute, optional payment promise or last contact, then see the decision and reminder availability change. The existing invoice identity, amount and due date are preserved. Dates use the labelled fixed simulation clock; changes remain in memory until reload/reset and never send a message. Paid invoices cannot be edited. Native browser/mobile verification of this increment is pending; do not infer it is published from a successful preview build.

## Verification

Run the dependency-free rule and preview checks with Node.js:

```sh
node --test tests/*.test.cjs
```

These checks cover both stage boundaries, blocked states, invalid identities/dates, and invoice-state rechecks. They do not verify browser layout or email delivery.

No live email delivery, payment processing, authentication or persistent customer storage are connected. This prototype is not ready for commercial operation.

## Public demo

`node scripts/build-static.cjs` creates `dist` with only the two demo assets. Netlify configuration runs the checks before building. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for provider evidence and access/verification requirements. The public fictional-data demo is available at https://cobro-agent-rodrigo.netlify.app/ (published 2026-10-06 on Netlify Free). The hosted build passed 34 tests and the deployed desktop simulation was exercised. Mobile verification and persistent lead capture remain pending.

## Proposed pilot

The demo now describes a proposed pilot for small B2B agencies/consultancies and links to the simulation. US$29 for 30 days is an unvalidated price hypothesis; signup, capture and purchase are unavailable. [docs/PILOT.md](docs/PILOT.md) defines the scope, validation sequence and private interest-capture acceptance gates.
