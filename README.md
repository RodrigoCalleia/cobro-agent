# Cobro Agent

Interactive B2B invoice follow-up prototype using fictional data and deterministic rules.

Open index.html with cobro-engine.js in the same directory to explore invoice prioritization, reminder previews and simulated payments. Reminder text is friendly at 1–7 overdue days and direct at 8–30 days. Blocked decisions do not produce a preview.

## Verification

Run the dependency-free rule and preview checks with Node.js:

```sh
node --test tests/cobro-engine.test.cjs
```

These checks cover both stage boundaries, blocked states, invalid identities/dates, and invoice-state rechecks. They do not verify browser layout or email delivery.

No live email delivery, payment processing, authentication or persistent customer storage are connected. This prototype is not ready for commercial operation.
