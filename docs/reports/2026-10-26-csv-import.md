# CSV import preparation — 2026-10-26

## Scope

PR #14 adds a local CSV import affordance to the fictional invoice demo. It accepts the columns `id,client,amount,due,promise,state`, applies the existing deterministic decision validation, skips invalid rows and duplicate invoice IDs, and keeps imported data in browser memory only.

This is an MVP preparation step for the agreed CSV/Excel workflow. It does not create a server endpoint, persist data, send messages, handle real invoices, collect contacts, or process payments.

## Evidence

- Isolated branch: `product/csv-import-2026-10-26`
- PR: https://github.com/RodrigoCalleia/cobro-agent/pull/14
- Product commit: `2671dbdce3c96601cc197dc1b173bd9734fc4cb5`
- Netlify deploy preview status: successful
- Preview: https://deploy-preview-14--cobro-agent-rodrigo.netlify.app
- Embedded JavaScript syntax check: passed for both script blocks
- Full Node suite: 296/296 passed after installing the declared dependency set with `npm install --ignore-scripts --no-audit --no-fund`
- Static build: passed; exactly two demo assets produced in `dist`

## Limits and next step

The PR is still open and draft. Manual mobile/desktop visual verification remains pending. Do not describe CSV import as integrated or deployed to production until those checks pass and the PR is merged.

Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Visual verification attempt — 2026-10-26

- The requested public preview URL was opened read-only, but Netlify Team Protection redirected it to a sign-in wall ("This site is private"). No preview UI could be inspected from this session.
- The existing public production URL remained reachable and showed the older `Cobro · prototipo` experience; it does not contain the PR #14 CSV control. This is expected because PR #14 is not merged or deployed, and is not evidence of a failed CSV implementation.
- Desktop/mobile visual acceptance therefore remains **not verified**. Do not merge or call the feature integrated/deployed until an authorized preview session is available and both viewport checks pass.
- No login was attempted, no settings were changed, and no external message or spend occurred.


## Follow-up hardening — 2026-10-26

- Improved the local parser to accept quoted CSV fields and preserve commas inside quoted values.
- Added an inline format hint next to the import control.
- Change commit: `06265c3f5094e7fd35f6dcd1e1caad2bf6e7bd6a`.
- This remains browser-local and does not alter contact, persistence, messaging, payment or backend scope.
- The full suite and static build should be rerun from this exact head before merge; visual desktop/mobile acceptance remains blocked by Netlify Team Protection.


## Verification after hardening — 2026-10-26

- Exact branch head tested: `ad2f2fc55aff8e6535500f9146a2dc7e86f53ae7`.
- First full-suite run had one intermittent failure in the existing Netlify contact-rights runtime test; the static build passed.
- Immediate repeat on the same head passed **296/296** tests.
- This confirms no reproducible regression from the CSV parser hardening, but the test remains timing-sensitive and should be watched in CI/merge review.


## CSV template follow-up — 2026-10-27

- Added a browser-local **Descargar plantilla** action beside the CSV importer.
- The generated file contains only fictional example values and the documented columns; it does not upload, persist, contact, or send data.
- This reduces setup friction for the first MVP walkthroughs while preserving the no-backend boundary.
- The branch remains unmerged and visual desktop/mobile acceptance is still pending.


## Verification after CSV template — 2026-10-27

- Exact branch head verified locally: `3f7542a2567bbed37b864bc9bfee97393bb1e68a`.
- Installed declared dependencies with `npm install --ignore-scripts --no-audit --no-fund` (no paid service or subscription).
- Full Node suite: **296/296 passed**, 0 failed.
- Static build: **passed**, producing exactly two demo assets.
- This verification covers the template follow-up head; no product behavior beyond the browser-local CSV/template scope was enabled.
- Netlify combined status for the same head: **success**. Visual desktop/mobile inspection remains blocked by Team Protection.

## Walkthrough de validación — 2026-10-27

- Se agregó [docs/VALIDATION_WALKTHROUGH.md](../VALIDATION_WALKTHROUGH.md) para preparar demostraciones controladas del MVP CSV/Excel.
- Incluye un guion de 10–15 minutos y criterios separados para interés, dolor, prueba y pago; no convierte visitas, benchmarking u opiniones en evidencia.
- Mantiene fuera del repositorio contactos, datos personales/deudores, outreach, captura pública, WhatsApp, pagos, OAuth, Tiendanube e integraciones grandes.
- Es un cambio documental; no modifica el producto ni habilita operación real. No se repitió la suite porque no hubo cambio de código: la evidencia vigente sigue siendo 296/296 tests y build de dos assets.
- PR #14 sigue draft/unmerged; la revisión visual desktop/mobile continúa bloqueada por Netlify Team Protection.
- Gasto: USD 0. Ingresos: USD 0. Clientes/contactos: 0.

## Resultado de importación accesible — 2026-10-27

- Reemplacé el `window.alert` del importador CSV por un mensaje persistente `aria-live="polite"` en la interfaz.
- El resultado informa cuántas facturas válidas se agregaron y que las filas inválidas o duplicadas fueron omitidas.
- Esto mejora la demo para lectores de pantalla y evita perder el resultado del procesamiento; no agrega backend, persistencia, contactos, mensajes, pagos ni datos reales.
- Cambio de código: [2d2bb4a](https://github.com/RodrigoCalleia/cobro-agent/commit/2d2bb4a697bc4aa80ff1d35ea45b262fa6168bfc).
- Verificación pendiente: ejecutar la suite/build sobre este nuevo head antes de integrar. La revisión visual desktop/mobile continúa bloqueada por Team Protection.
- Gasto: USD 0. Ingresos: USD 0.

## Verificación dirigida de feedback accesible — 2026-10-27

- Se volvió a leer el head de `index.html` y se confirmó el nodo `csvStatus` con `aria-live="polite"`.
- El bloque JavaScript inline pasó evaluación sintáctica con `new Function`.
- Se confirmó que el `window.alert` anterior del importador ya no está presente.
- La suite completa y el build quedan pendientes sobre este nuevo head; no se declara integración ni despliegue.

## Verificación de head actual — 2026-10-27

- Head revisado: `6b2bcbf5d17936f67a59a887181292a8f2bf86d9`.
- GitHub Combined Status reporta `netlify/cobro-agent-rodrigo/deploy-preview: success`.
- No hay ejecuciones de GitHub Actions asociadas al head.
- La fuente `index.html` actual conserva el feedback `aria-live="polite"` y el script inline ya pasó la evaluación sintáctica dirigida.
- No se afirma una nueva suite completa/build local: esta sesión no dispone de checkout ejecutable ni de un workflow remoto para correr `npm test`/`npm run build`. La última evidencia completa sigue siendo 296/296 tests y build de dos assets en el head anterior.
- La revisión visual sigue bloqueada por Netlify Team Protection; PR #14 permanece draft/unmerged.
