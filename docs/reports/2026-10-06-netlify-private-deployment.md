# Netlify deployment — 2026-10-06

Current status: public visibility was explicitly approved and enabled on 2026-10-06. This report retains the initial private-stage evidence and records the public closure below.

## Verified result

Netlify project `cobro-agent-rodrigo` was created from RodrigoCalleia/cobro-agent main on the authenticated Free plan. GitHub identity authorization and installation permissions were approved by the owner. The app installation selected only cobro-agent.

Production deploy `6ac50050db1a952bf7e9bd8a` is published from `e204d8d82225c4bc39b5e9a4476fa6822c26995e`; the dashboard displayed `main@e204d8d`, “Currently published” and “Published at 11:06 AM”.

- Site: https://cobro-agent-rodrigo.netlify.app/
- Dashboard: https://app.netlify.com/projects/cobro-agent-rodrigo/overview
- Deploy details: https://app.netlify.com/projects/cobro-agent-rodrigo/deploys/6ac50050db1a952bf7e9bd8a

Initial visibility was private. At that stage the authenticated browser opened the demo after an access redirect. Public visibility was enabled later, as recorded below.

## Configuration and hosted verification

Netlify recognized the repository's netlify.toml: main branch, root base directory, `node --test tests/*.test.cjs && node scripts/build-static.cjs`, publish directory dist. No environment variables, new credentials, paid upgrade, custom domain or operational integration was added.

The actual Netlify build log showed:
- 34 tests, 34 passed, zero failed.
- “Static build complete: 2 demo assets in dist”.
- Build command completed and processing finished.

Independent task-scoped QA inspected GitHub main and the build configuration. GitHub exposed no check runs/status records/Actions runs at that inspection; therefore the test-success evidence above comes from Netlify's actual log, not a GitHub hosted check.

## Browser checks on the private deployed demo

Using only fictional data:
- Seed invoice F-001 opened the friendly reminder draft with its invoice details.
- Added QA-008, fictional client, amount 100, due 2026-09-25: rendered “Seguimiento directo”; preview requested a concrete payment date and showed eight overdue days.
- Simulated payment changed that fixture to “Pagada” and removed its reminder action.
- Seed disputed invoice had no “Ver borrador” button.
- Reset removed the fixture and restored six seed invoices.
- JSON export downloaded and parsed: simulation=true, date=2026-10-03, six invoices, each with its decision.
- Desktop screenshot showed the expected layout and readable controls. The fixed-date, fictional-data, no-IA, no-delivery and no-storage notices remained present.

No mobile viewport check, anonymous-access check or contact-storage check is claimed. Observed console errors concerned browser-extension metadata; no application failure was observed in the exercised interactions. Real invoices and contact data were not used.

## Initial approval boundary

Netlify defaults this project to private. Its “Make public” dialog proposes access for anyone on the internet while deploy previews remain private to the team.

Automatic approval review rejected the visibility-change action because explicit owner approval for public access was not present. At that point visibility was not changed; no workaround or indirect execution was attempted. The existing dialog was retained for explicit approval.

## Public-visibility closure — 2026-10-06

The owner explicitly approved the pending public action. The existing “Make public” dialog completed successfully. Netlify displayed the Public badge, “Your project is public” and “Anyone can visit your production site”; deploy previews remain private to the team. A screenshot of that success state was retained for the owner.

Reloading https://cobro-agent-rodrigo.netlify.app/ displayed “Menos seguimiento. Más claridad sobre tu caja.” The product source remains the published commit above; this step changed visibility, not product code. A separate anonymous-session retrieval was not completed, and mobile verification remains pending. No claim of those additional checks is made.

Next: mobile and separate anonymous-session checks, then persistent interest capture with its required storage verification. No external messages, purchases, paid subscriptions, real invoices, contact capture or payment processing were activated.

## Documentation update

This report and the board are documentation only; no product or build configuration changed. The recording commit uses [skip netlify] to avoid an unnecessary repeat deployment. Netlify's documented skip directive was checked on 2026-10-06:
https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/
