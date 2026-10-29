# Runbook de staging en VPS — 2026-10-29

## Objetivo

Usar un VPS autorizado sólo como entorno de staging/preview de Rondacobro mientras las PR #14 y #15 siguen sin integrar. El VPS no debe convertirse en producción comercial ni procesar cobros, contactos o facturas reales sin una autorización separada.

## Acceso mínimo solicitado

- Usuario Linux dedicado para `cobro-agent`, sin acceso root.
- Acceso SSH por clave, con la clave privada fuera del repositorio.
- Permisos sólo sobre el directorio del proyecto y el servicio de staging.
- Firewall con el puerto de administración restringido; el puerto web puede exponerse sólo si el propietario autoriza la URL.
- No compartir credenciales del otro sistema alojado en el VPS.
- No copiar bases, secretos, archivos .env ni datos del otro sistema.

## Requisitos técnicos

- Node.js `>=22.12.0`, según `package.json`.
- Git y un servidor HTTP reverso ya disponible o una alternativa mínima para servir `dist/`.
- HTTPS y un dominio/subdominio sólo si el propietario desea una URL pública.
- Espacio suficiente para checkout, dependencias y logs acotados.
- Rotación o limpieza de logs; no registrar payloads con datos personales.

## Flujo de despliegue propuesto

1. Crear el usuario y directorio aislado.
2. Clonar sólo `RodrigoCalleia/cobro-agent` y fijar el commit de la PR revisada.
3. Ejecutar `npm install --ignore-scripts --no-audit --no-fund`.
4. Ejecutar `npm test` y `npm run build`.
5. Servir el build estático en staging.
6. Verificar desktop y móvil desde una URL autorizada.
7. Registrar commit, resultado y fecha en el reporte.
8. Destruir el staging o rotar el commit cuando finalice la revisión.

No se debe apuntar el VPS a `main` automáticamente ni declarar producción por el solo hecho de servir `dist/`.

## Agentes de trabajo

Los agentes son tareas acotadas, no procesos permanentes:

- **Coordinación:** elige una tarea y conserva la fuente de verdad en GitHub.
- **Implementación:** modifica sólo la rama aislada asignada.
- **QA independiente:** revisa comportamiento, claims y regresiones sin escribir.
- **Revisión de despliegue:** comprueba build, URL y límites de staging.
- **Validación comercial:** mantiene los conteos y separa evidencia preparada de evidencia real.

Ningún agente debe enviar mensajes, cobrar, activar suscripciones ni leer datos del otro sistema. La revisión humana del propietario sigue siendo necesaria para integrar o publicar.

## Criterio de éxito del staging

El staging cuenta como verificado sólo si:

- el commit servido está identificado;
- `npm test` y `npm run build` pasan en ese commit;
- la URL autorizada responde desde desktop y móvil;
- el cockpit, CSV y exportación local visibles corresponden a la rama;
- no hay contactos, pagos ni persistencia real;
- el reporte incluye limitaciones y no confunde staging con producción.

## Estado

Este runbook no entrega acceso ni despliega nada. Queda pendiente que el propietario habilite un usuario SSH dedicado y una URL/puerto de staging, sin entregar secretos en el repositorio.


## Convivencia con CEO IA y reinicios del VPS

El VPS ya aloja CEO IA. Rondacobro debe mantenerse completamente separado:

- Directorio sugerido: `/srv/rondacobro-staging/`; nunca usar el directorio de CEO IA.
- Usuario y grupo propios, sin reutilizar permisos, claves ni archivos `.env` de CEO IA.
- Puerto y nombre de servicio propios, por ejemplo `rondacobro-staging`; no reemplazar ni reiniciar el servicio de CEO IA.
- Logs y archivos temporales en rutas propias, con límites de tamaño y sin payloads personales.
- El checkout debe quedar fijado al commit revisado, no a una rama mutable.

Si un reinicio del VPS detiene los procesos, se acepta una recuperación manual de pocos minutos en esta fase. El procedimiento será: comprobar que CEO IA esté operativo, iniciar sólo el servicio de staging de Rondacobro, verificar la URL y registrar el commit servido. No se agregará un supervisor persistente ni se modificará el arranque del sistema sin autorización separada.
