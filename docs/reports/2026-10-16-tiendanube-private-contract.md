# Contrato privado Tiendanube/Nuvemshop — 2026-10-16

## Trabajo realizado

Se dejó una especificación desconectada para el primer piloto de Rondacobro como integración Tiendanube/Nuvemshop. Define límite de producto, contrato lógico de instalación/lectura/decisión, separación de datos, controles de autorización, deadline compartido, idempotencia, auditoría y criterios de aceptación.

No se modificó código, rutas, configuración de proveedor, OAuth, almacenamiento real, mensajería ni facturación. No se activó ninguna cuenta ni se contactó a terceros.

- [Contrato mínimo](../TIENDANUBE_PRIVATE_INTEGRATION.md)
- [Investigación de entrada](./2026-10-16-tiendanube-market-entry.md)

## Verificación

El cambio es documental. No se ejecutó la suite de producto porque no hubo cambio de código; se verificará el contrato con pruebas sintéticas antes de conectar una credencial o una tienda. La rama parte de `main` en `a02a77c`.

## Decisión y bloqueos

La próxima implementación, si se autoriza acceso, debe ser un adaptador privado de lectura con fixtures sintéticos y sin envío. Continúan bloqueados OAuth productivo, Partner Portal/tienda demo, política específica, soporte, datos personales y publicación pública.

## Contabilidad

- Gasto comprobable: **USD 0**
- Ingreso comprobable: **USD 0**
- Leads/clientes verificados: **0**
