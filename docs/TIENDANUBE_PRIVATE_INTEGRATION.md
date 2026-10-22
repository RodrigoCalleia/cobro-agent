# Rondacobro — contrato mínimo de integración privada Tiendanube/Nuvemshop

Fecha: 2026-10-16  
Estado: diseño desconectado; no habilita OAuth, rutas públicas, jobs, mensajería ni datos reales.

## Objetivo y límite del primer piloto

El primer piloto debe demostrar que una tienda puede instalar una integración privada, leer únicamente órdenes necesarias, clasificar candidatos de seguimiento y dejar una decisión revisable. No procesa pagos, no escribe sobre clientes y no envía mensajes.

Flujo permitido:

1. Instalación OAuth con una tienda de prueba.
2. Validación de estado, tienda objetivo y expiración de autorización.
3. Lectura paginada de órdenes con scopes mínimos.
4. Normalización a un modelo interno sin copiar datos innecesarios.
5. Clasificación determinista y explicación asistida por IA, sin acción automática.
6. Revisión y aprobación explícita del comerciante.
7. Registro de auditoría de la decisión.
8. Resultado visible sólo en el entorno privado del piloto.

## Contrato lógico

### Entrada de instalación

- `provider`: `tiendanube` o `nuvemshop`.
- `store_id`: identificador opaco de la tienda.
- `authorization`: token cifrado fuera del repositorio, con expiración y scopes concedidos.
- `request_id`: identificador único para idempotencia.
- `issued_at`: instante de emisión.

Rechazar si falta un campo, el proveedor no coincide, la autorización está vencida, el request se repite con distinto contenido o el estado OAuth no coincide con la tienda objetivo.

### Lectura normalizada

Cada orden procesada conserva sólo:

- identificador opaco de orden;
- fecha de creación y vencimiento, si existe;
- estado de pago/envío necesario para la regla;
- importe y moneda para explicar la prioridad;
- referencia mínima al comprador, sólo si el caso aprobado la necesita.

No persistir tokens, credenciales, direcciones, teléfonos, correos ni notas libres en logs o fixtures. Separar datos de tienda, comprador, decisión y auditoría.

### Decisión y aprobación

Una decisión debe contener:

- `decision_id` y `order_id`;
- regla aplicada y explicación;
- fecha de cálculo;
- estado `proposed`, `approved`, `rejected` o `expired`;
- identidad del comerciante que aprobó, fuera de este repositorio;
- `audit_event_id`.

La aprobación no puede transformarse en envío: el adaptador de mensajería debe permanecer ausente hasta definir consentimiento, proveedor y política de retención.

## Seguridad, privacidad y resiliencia

- Scopes mínimos: comenzar sólo con lectura de órdenes; ampliar únicamente ante una necesidad demostrada.
- Todas las operaciones de red comparten un único deadline abortable. Un timeout produce `unverified`, nunca éxito.
- Reintentos sólo con claves idempotentes y límites; no reintentar después de cancelar el deadline.
- Webhooks y paginación, no sondeo continuo. Verificar firma, tienda objetivo y replay.
- Auditoría append-only a nivel de aplicación; no presentarla como WORM o cumplimiento regulatorio.
- Mensajes de error no deben revelar tokens, PII ni contenido de órdenes.
- Borrado y exportación de datos deben existir antes de un piloto con datos personales.
- Mantener rutas públicas, scheduler y almacenamiento real desconectados hasta completar revisión de amenazas y privacidad.

## Criterios de aceptación privados

1. Instalación válida crea una autorización ligada a una tienda de prueba y no expone el token.
2. Estado OAuth incorrecto, tienda distinta o autorización vencida fallan cerrado.
3. Paginación y rate limit no duplican órdenes ni decisiones.
4. La misma `request_id` es idempotente; payload distinto se rechaza.
5. Una clasificación no aprobada no envía ni modifica nada.
6. Una aprobación queda auditada y puede leerse exactamente una vez por su identificador.
7. Un timeout en SDK, lectura, auditoría o persistencia devuelve `unverified` y no afirma reparación.
8. Fixtures y logs contienen sólo datos sintéticos.

## Fuera de alcance y bloqueo

No construir todavía OAuth productivo, aplicación pública, cobro de suscripción, reparación automática, email/WhatsApp, storefront/checkout, tienda demo, homologación ni contacto comercial. Esos pasos requieren acceso autorizado a Partner Portal, política específica, soporte/contacto y validación de extremo a extremo.
