# Checklist de aceptación visual del preview — 2026-10-29

## Objetivo

Distinguir sin ambigüedad el preview de las PR #14/#15 de la demo anterior publicada en producción. Esta checklist no autoriza integración ni despliegue comercial.

## URL y commit

- [ ] URL de preview autorizada y accesible sin compartir credenciales en el repositorio.
- [ ] Commit servido coincide con el head de la PR revisada.
- [ ] La página responde desde el entorno de staging/preview, no desde la URL pública de producción.

## Marcadores visibles del MVP

En desktop y móvil deben aparecer:

- [ ] Cockpit “Visión de caja” con proyección a 7 y 30 días.
- [ ] Monto “En riesgo ahora”.
- [ ] Lista de tres prioridades sugeridas.
- [ ] Acción “Ver plan” o detalle equivalente con motivo y borrador.
- [ ] Texto explícito “No enviado: requiere aprobación humana”.
- [ ] Control “Importar CSV”.
- [ ] Control “Descargar plantilla”.
- [ ] Control “Exportar plan local”.
- [ ] Aviso de datos ficticios, memoria local y ausencia de cobros/mensajes.

## Interacción limitada

- [ ] Un CSV ficticio válido puede cargarse en memoria.
- [ ] Filas inválidas y duplicadas se omiten con aviso visible.
- [ ] La exportación local descarga un archivo sin llamar servicios externos.
- [ ] El detalle de prioridad se puede cerrar en móvil.
- [ ] No aparecen formularios de contacto, checkout, OAuth ni WhatsApp automático.

## Criterio de registro

Registrar en el reporte:

- fecha y hora de revisión;
- viewport desktop y móvil;
- commit observado;
- resultado de cada casilla;
- captura sin datos personales, si se necesita;
- defectos y decisión: corregir, aceptar o mantener bloqueado.

La captura de la demo anterior no valida este checklist: sólo demuestra que producción no contiene aún las mejoras de las PR.

## Estado

- Revisión visual del preview: pendiente.
- Producción: versión anterior observada.
- Integración de PR #14/#15: pendiente.
- No se habilitan mensajes, pagos, persistencia ni datos reales.
