# Evaluación de Pago TIC para Rondacobro

Fecha de consulta: 2026-10-07. Investigación de documentación pública oficial, sin cuenta, contacto comercial, credenciales, API real ni pago. Candidata pendiente; no proveedor contratado.

## Decisión del coordinador

Mantener Pago TIC en evaluación para cobrar nuestro propio piloto. Empezar, si se verifican alta y condiciones, por un pago único de 30 días sin renovación automática. No construir ahora una integración de cobro de facturas de terceros ni custodiar su dinero. Son alcances diferentes y el segundo requiere autorización y requisitos adicionales.

La empresa anuncia botón/checkout, recurrencia, conciliación, reintentos y paneles. Anuncia integración sin costos fijos ni mantenimiento; eso no demuestra ausencia de comisiones por transacción. También ofrece gestión de mora, por lo que hay solapamiento con nuestra propuesta. Inferencia estratégica: validar si las agencias pagarían por la revisión contextual de recordatorios y pausas ante disputas/promesas, antes de duplicar funciones del proveedor. No atribuirnos sus tasas comerciales de éxito. [1]

## Evidencia técnica

La API permite crear pagos con referencia externa única y formulario alojado; repetir la referencia se rechaza. Un retry de creación debe reconciliar la solicitud existente, no inventar otra referencia. [2]

Hay un flujo de adhesión y emisión posterior de pagos recurrentes: no asumir que registrar una adhesión programa por sí solo todos los cobros del SaaS. [3]

Las notificaciones POST informan cambios de estado y tienen reenvíos. La documentación describe cifrado opcional; no establece aquí una firma moderna ni protección completa frente a replay. [4][5] Diseño requerido, aún no implementado: consultar el pago desde el servidor con credenciales privadas, comprobar comercio/referencia/importe/moneda contra la orden propia y procesar estados de forma durable e idempotente. El importe final puede incluir cargos al pagador: comparar conceptos e importe con una política explícita de comisiones. La vuelta del navegador al sitio no prueba un pago. Verificar devoluciones y estados posteriores; no usar un evento antiguo para reactivar acceso. El GET documentado incluye estado, comisiones y reembolsos. [6]

Credenciales API se facilitan después del alta mediante atención al cliente; tokens y secretos deben quedar en runtime privado. [7] Existen tarjetas de prueba para entorno/modo STARTING, pero no tenemos una entidad ni credenciales de prueba habilitadas. [8]

## Condiciones no resueltas

No encontré una tabla aplicable y verificable de comisiones ni un plazo de liquidación para nuestro caso. Antes de elegir deben quedar por escrito:

- Alta elegible para el titular/vendedor real, documentación exigida, cuenta de liquidación y permisos API.
- Costo por medio de pago, impuestos aplicables, mínimos, cargos por devolución/contracargo y cualquier condición de volumen o integración.
- Plazos de acreditación y retiro, reservas y diferencia entre pago aprobado y fondos efectivamente disponibles.
- Moneda y precio final: la tabla técnica pública consultada enumera ARS y data de 2019. Publicitar tarjetas internacionales no confirma liquidación en USD. El piloto de US$29 es una hipótesis de precio; todavía no tiene importe de checkout en pesos definido. [9]
- Reglas de cancelación, reintentos, devoluciones y seguridad de notificaciones, con evidencia actual del entorno ofrecido.

La FAQ de entidades describe documentación institucional; no concluyo de eso que una persona o monotributista esté admitida o excluida. Debe confirmarse para el vendedor real. [10] Pago procesado y comprobante del procesador no resuelven automáticamente nuestra facturación ni habilitan un piloto operativo.

Próximo paso: conservar esta candidata y resolver esas incógnitas cuando exista autorización para contactar al proveedor o acceso a condiciones de una cuenta habilitada. No se envió consulta ni se prometió un alta. Captura de interesados, acceso Netlify y privacidad siguen siendo hitos previos separados.

## Fuentes oficiales

1. https://pagotic.com/empresas/
2. https://documentos.paypertic.com/display/API/Crear+un+pago
3. https://documentos.paypertic.com/pages/viewpage.action?pageId=157516176
4. https://documentos.paypertic.com/display/SOP/Servicio+de+notificaciones
5. https://documentos.paypertic.com/display/SOP/Notificaciones
6. https://documentos.paypertic.com/display/API/Obtener+un+pago
7. https://documentos.paypertic.com/pages/viewpage.action?pageId=27164677
8. https://documentos.paypertic.com/display/SOP/Tarjetas+de+prueba
9. https://documentos.paypertic.com/display/API/Monedas+disponibles
10. https://pagotic.com/preguntas-frecuentes/
