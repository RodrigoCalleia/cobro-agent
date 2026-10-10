# Production demo verification — 2026-10-10

## Outcome

The current public Netlify production site does not match the merged `main` at `cea02c8aa8cb958f37fe1a173ca12c7c8aaf58d9`. The latest product integration is present in GitHub, but publication of that revision is not verified.

## Evidence

- Public URL refreshed once: https://cobro-agent-rodrigo.netlify.app/
- Observed public markers: title `Cobro · prototipo`, brand `cobro.`, hero `Menos seguimiento. Más claridad sobre tu caja.`, and action labels `Agregar factura de prueba`, `Reiniciar demo`, `Exportar decisiones JSON`.
- Current `main` markers: title `Rondacobro · simulación B2B`, brand `rondacobro.`, eyebrow `Seguimiento B2B en una sola vista`, product-status card, workspace title `Tu tablero de seguimiento`, and action labels `Agregar factura`, `Reiniciar`, `Exportar JSON`.
- The differences are unambiguous and remained after a browser reload.
- GitHub exposed no commit status for `cea02c8`; absence of a status is not deployment evidence.
- The Netlify dashboard required an authenticated session in the available browser, so the assigned production deploy, build log and exact cause could not be inspected.

## Independent review

An independent read-only reviewer agreed that production is serving an older revision. The evidence does not distinguish between a missing production build, an incorrect branch/publish directory, or an older artifact assigned to the production domain. It also does not justify claiming that the new `main` is public.

## Safety boundary

The observed public page still states that no email, payments, registration or storage is connected. No capture input was observed. This cycle did not call or submit the pilot-interest endpoint and did not run a real repair or provider write. The merged public function remains documented as unconditional `503/unavailable`.

## Verification scope

This was a live public-page/source comparison only. No code changed, so the previously accepted 296-test suite was not repeated without new product evidence.

## Accounting

- Spend: **USD 0**
- Revenue: **USD 0**
- Verified leads/customers: **0**

## Blocker and next action

Restore authenticated access to the existing Netlify project, inspect which deploy is assigned to production, and rebuild or promote the merged `main` revision while keeping capture and repair routes disabled. Then verify the public Rondacobro markers on desktop and mobile. Do not create a new service, deploy to Vercel Hobby, or claim publication before that evidence exists.
