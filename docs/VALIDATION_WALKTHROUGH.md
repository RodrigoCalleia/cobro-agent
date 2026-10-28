# Walkthrough de validación del MVP CSV

Fecha: 2026-10-27  
Rama: `product/csv-import-2026-10-26`  
PR: [#14](https://github.com/RodrigoCalleia/cobro-agent/pull/14)

## Objetivo

Reducir fricción para una demostración controlada del MVP acordado: importar un CSV/Excel, revisar la priorización y observar un borrador, manteniendo aprobación humana y auditoría. Este documento prepara entrevistas y pruebas; no es evidencia de demanda.

## Guion de 10–15 minutos

1. Explicar que la demo usa datos ficticios y no envía mensajes ni procesa pagos.
2. Descargar `rondacobro-plantilla.csv` desde la demo o usar un archivo de prueba con las columnas:
   `id,client,amount,due,promise,state`.
3. Importar el archivo y observar cuántas filas válidas se agregan.
4. Revisar una factura priorizada y abrir el borrador de recordatorio.
5. Preguntar qué parte refleja el trabajo actual y qué parte no confiaría aún.
6. Registrar una observación sólo si existe una persona autorizada, una fecha, una respuesta y una evidencia asociada.

## Criterios de evidencia

- **Interés:** la persona pide continuar o solicita una prueba con sus propios datos.
- **Dolor:** describe una tarea concreta y recurrente, con contexto operativo verificable.
- **Prueba:** acepta un alcance, duración y resultado observable antes de usar datos reales.
- **Pago:** sólo contar cuando exista aceptación explícita y un ingreso comprobable.

No convertir una visita, un clic, un referente de benchmarking o una opinión del coordinador en cliente, entrevista, dolor, prueba o pago.

## Límites

- No agregar contactos, emails, teléfonos, nombres personales ni datos de deudores al repositorio.
- No enviar outreach ni habilitar captura pública sin autorización explícita, consentimiento, aviso y almacenamiento verificado.
- No adelantar WhatsApp automático, pagos, OAuth, Tiendanube ni integraciones grandes.
- La propuesta de US$29 por 30 días sigue siendo una hipótesis y no una oferta activa.

## Próximo paso

Con revisión visual autorizada del preview, usar este guion en las primeras entrevistas aprobadas y actualizar el mapa privado con evidencia fechada. Hasta entonces, PR #14 permanece draft y el CSV se considera preparado, no integrado ni desplegado.
