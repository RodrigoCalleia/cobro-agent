# Cobro Agent

Interactive B2B invoice follow-up prototype using fictional data and deterministic rules.

Open index.html with cobro-engine.js in the same directory to explore invoice prioritization, reminder previews and simulated payments. Reminder text is friendly at 1–7 overdue days and direct at 8–30 days. Blocked decisions do not produce a preview.

## Verification

Run the dependency-free rule and preview checks with Node.js:

```sh
node --test tests/*.test.cjs
```

These checks cover both stage boundaries, blocked states, invalid identities/dates, and invoice-state rechecks. They do not verify browser layout or email delivery.

No live email delivery, payment processing, authentication or persistent customer storage are connected. This prototype is not ready for commercial operation.

## Demo deployment preparation

`node scripts/build-static.cjs` creates `dist` with only the two demo assets. Netlify configuration runs the checks before building. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for provider evidence and access/verification requirements. No public deployment or lead capture is connected yet.

## Proposed pilot

The demo now describes a proposed pilot for small B2B agencies/consultancies and links to the simulation. US$29 for 30 days is an unvalidated price hypothesis; signup, capture and purchase are unavailable. [docs/PILOT.md](docs/PILOT.md) defines the scope, validation sequence and private interest-capture acceptance gates.
