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


## CSV escaped-quote hardening — 2026-10-28

- Continued PR #14 on the isolated branch with a bounded parser fix for common CSV quoting edge cases.
- The browser-local parser now preserves commas inside quoted fields, decodes escaped double quotes represented by two consecutive quote characters, and strips a UTF-8 BOM.
- Targeted verification on branch head `47d916e` passed syntax evaluation and parsed quoted-comma and escaped-quote fixtures as expected.
- This does not add backend, persistence, contacts, messaging, payments or real-invoice behavior.
- Full suite/build on this new code head and authorized desktop/mobile visual review remain pending. PR #14 stays draft/unmerged; production is not claimed updated.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.

## CSV duplicate-ID guard — 2026-10-28

- Independent review found a data-integrity gap: duplicate invoice IDs repeated within one CSV could both pass the filter because only the pre-existing invoice list was checked.
- Fixed the browser-local importer to track seen IDs in a Set seeded from existing invoices and updated as each row is accepted.
- Product commit: [1b45fd7](https://github.com/RodrigoCalleia/cobro-agent/commit/1b45fd75ff802b966e47bb60e860bf238a77170e).
- Targeted verification passed parser syntax, quoted-comma/escaped-quote fixtures and duplicate filtering for existing and same-file IDs.
- Full suite/build on this new code head and authorized desktop/mobile review remain pending. PR #14 remains draft/unmerged; production is not claimed updated.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.

## CSV malformed-quote guard — 2026-10-28

- Independent parser audit found that an unclosed quoted field could be silently accepted as a valid invoice row.
- Added a fail-closed guard: when parsing ends with an open quoted field, the browser-local import returns no rows rather than importing malformed data.
- Product commit: [ad07185](https://github.com/RodrigoCalleia/cobro-agent/commit/ad071854ce96ec668b170ac2a15a232abe00ed47).
- Targeted verification passed syntax evaluation, valid quoted-field fixtures and rejection of an unclosed-quote fixture.
- Full suite/build on this new code head and authorized desktop/mobile review remain pending. PR #14 remains draft/unmerged; production is not claimed updated.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.

## CSV unescaped-quote guard — 2026-10-28

- Independent parser audit found that an unescaped double quote inside an unquoted field was silently removed, changing imported customer text (for example, `ACME "North"` became `ACME North`).
- The browser-local parser now fails closed when a quote appears after existing unquoted field content; valid quoted commas and escaped double quotes remain supported.
- Product commit: [7449e98](https://github.com/RodrigoCalleia/cobro-agent/commit/7449e98a317c35bf9c5903616eb1c93a9f7028b4).
- Targeted verification on blob `f91082b`: valid quoted-comma fixture parsed one row; malformed unescaped-quote fixture parsed zero rows; script evaluation passed with the existing decision stub.
- Full suite/build on this new code head and authorized desktop/mobile visual review remain pending. PR #14 remains draft/unmerged; production is not claimed updated.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Verificación tras guard de comillas no escapadas — 2026-10-28

- Head exacto verificado localmente: `4dfe1c680608ef5480f06e521252cd9a2f77d9d8`.
- Se instaló el conjunto de dependencias declarado sin scripts, auditoría ni fondos: `npm install --ignore-scripts --no-audit --no-fund`.
- Suite Node completa: **296/296 aprobada**, 0 fallos.
- Build estático: **aprobado**, con exactamente dos assets de demo.
- Esta verificación cubre el guard de comillas no escapadas y no amplía el límite navegador-local: no hay backend, persistencia, contactos, mensajería, pagos ni facturas reales.
- La revisión visual desktop/mobile sigue pendiente por Netlify Team Protection; PR #14 continúa draft/unmerged y producción no se declara actualizada.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Rechazo de texto tras comilla de cierre — 2026-10-28

- Auditoría independiente reprodujo que una comilla de cierre seguida de texto ("ACME" North) se aceptaba y alteraba silenciosamente el nombre importado.
- El parser ahora exige coma o fin de registro después de una comilla de cierre; el archivo malformado se rechaza sin importar filas alteradas. Los campos con comas entrecomillados y comillas escapadas continúan soportados.
- Producto: [80edb9a](https://github.com/RodrigoCalleia/cobro-agent/commit/80edb9a901bc00169a0213f58e02833617c892d4).
- Regresión dirigida: fixture malformado rechazado y fixture válido con coma entrecomillada preservado.
- Verificación local en el nuevo head: npm test 296/296, npm run build aprobado con exactamente dos assets; no hay datos, contactos, mensajería ni persistencia reales.
- PR #14 sigue draft/unmerged; main y producción no cambiaron. La revisión visual desktop/mobile continúa bloqueada por Netlify Team Protection.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Cockpit de visión de caja — 2026-10-28

- Se agregó una primera capa orientada a decisión: proyección ficticia de cobros a 7 y 30 días, monto en riesgo y ranking de las tres facturas que requieren atención.
- Cada prioridad muestra cliente/factura, días hasta o desde vencimiento, decisión del motor e importe. Todo continúa en memoria del navegador; no hay envíos, persistencia, contactos ni pagos.
- Producto: [eb76a3e](https://github.com/RodrigoCalleia/cobro-agent/commit/eb76a3e536fa6b565acc08ed69e21e5a6a5bf345).
- Verificación local: npm test 296/296 y npm run build aprobado con exactamente dos assets.
- La rama es nueva y aislada desde PR #14; no está integrada ni desplegada en producción. Revisión visual autorizada sigue pendiente.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Prioridad explicable y borrador revisable — 2026-10-28

- Cada prioridad del cockpit ahora abre un detalle con importe, vencimiento, decisión del motor y un borrador de acción contextual.
- El borrador es sólo texto de simulación y muestra explícitamente que requiere aprobación humana; no se envía ni se guarda.
- Producto: [2654e37](https://github.com/RodrigoCalleia/cobro-agent/commit/2654e37a753bebb517a1cf0221c6adf3f283227b).
- Verificación local posterior: npm test 296/296; npm run build aprobado con exactamente dos assets.
- PR #15 continúa draft y dependiente del trabajo CSV de PR #14; no integrado ni desplegado. Revisión visual sigue pendiente.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Kit de validación comercial — 2026-10-28

- Se preparó un guion de 10 entrevistas, una prueba controlada del cockpit y criterios para considerar evidencia de valor.
- Se preserva el estado real: 30 candidatos de mapa sin contacto verificado, 10 prioritarios como objetivo, 0 entrevistas, 0 dolores confirmados, 0 pruebas y 0 pilotos pagos.
- Documento: [pilot interview kit](../validation/pilot-interview-kit-2026-10-28.md).
- No se enviaron mensajes ni se agregaron clientes; el precio de US$29 por 30 días continúa siendo una hipótesis.
- Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Reconciliación del mapa de referentes — 2026-10-28

- La revisión completa de PR #13 confirma 10 referentes públicos documentados: GESINCO, Cobrofy, Debitia, Caudo, Gutnova, Tiendanube/Nuvemshop, Webflow ADV, NexoSmart, Sistemas Plenario y Credituls.
- Este hito está preparado/documentado; no equivale a clientes, prospectos, entrevistas ni demanda validada.
- Se corrige el resumen anterior de 3 referentes como información desactualizada.
- Prospectos verificados, entrevistas, dolores, pruebas y pilotos pagos permanecen en 0.
- No hubo contactos ni cambios de `main`. Spend: USD 0. Revenue: USD 0. Customer/contact data: none.


## Guard responsive de prioridades — 2026-10-28

- Auditoría independiente no encontró defectos funcionales en proyección, ranking ni borradores; señaló un riesgo potencial de desborde en pantallas muy angostas con nombres largos.
- Se agregó `min-width: 0` y ajuste de texto en cada prioridad para evitar scroll horizontal innecesario.
- Producto: [ab3d2e8](https://github.com/RodrigoCalleia/cobro-agent/commit/ab3d2e8e3b3d8157a34756095692ba507952cb70).
- Primera corrida local: 295/296 por un timeout intermitente ya conocido del runtime Netlify; repetición inmediata: **296/296**. Build estático: aprobado con 2 assets.
- No hubo cambios en `main`, despliegue, contactos ni datos reales. Spend: USD 0. Revenue: USD 0.
