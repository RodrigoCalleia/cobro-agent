# Handoff de acceso al VPS — 2026-10-29

## Propósito

Preparar un acceso mínimo para montar el staging de Rondacobro junto a CEO IA sin tocar el sistema existente. Este documento no contiene credenciales ni valores privados.

## Datos técnicos necesarios

Entregar por un canal privado, no en GitHub:

- Hostname o IP del VPS.
- Puerto SSH si no es el estándar.
- Usuario dedicado para Rondacobro.
- Método de entrega de clave pública SSH.
- Directorio asignado.
- Puerto o subdominio de staging.
- Comando actual para comprobar que CEO IA está operativo.
- Restricciones del firewall y proveedor.
- Política de reinicio aceptada: recuperación manual de pocos minutos.

No hace falta entregar root, contraseñas del proveedor, claves de CEO IA ni acceso a su base de datos.

## Preflight antes de tocar el VPS

1. Comprobar estado de CEO IA y registrar sólo el resultado, sin extraer datos.
2. Confirmar que el usuario de Rondacobro no puede leer el directorio de CEO IA.
3. Crear o confirmar /srv/rondacobro-staging/.
4. Confirmar puerto y ruta de logs propios.
5. Verificar espacio, Node >=22.12.0, Git y acceso saliente sólo para instalar dependencias si está autorizado.
6. Acordar la URL de staging y su protección de acceso.

## Primera puesta en marcha

1. Clonar el repositorio en la carpeta propia.
2. Fijar el commit de la PR revisada.
3. Instalar dependencias sin scripts, auditoría ni fondos.
4. Ejecutar npm test y npm run build.
5. Servir dist/ con un proceso propio.
6. Ejecutar la checklist visual en desktop y móvil.
7. Registrar commit, URL, fecha y resultado en el reporte.
8. Detener y eliminar el staging si la revisión no es aprobada.

## Recuperación después de reinicio

- Comprobar CEO IA.
- Iniciar sólo el proceso de Rondacobro.
- Confirmar URL y commit.
- Repetir una comprobación breve de salud.
- No declarar producción ni integración por estar el proceso activo.

## Límites

- No mensajes, pagos, OAuth, WhatsApp, Tiendanube ni facturas reales.
- No persistencia de contactos ni datos del otro sistema.
- No secretos en el repositorio.
- Los agentes trabajan por tareas acotadas; no quedan activos permanentemente ni reciben acceso global.
