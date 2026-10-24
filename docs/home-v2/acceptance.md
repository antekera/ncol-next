# Entrega local y aceptación pendiente

Rama `feat/home-v2-plan`; [PR borrador #315](https://github.com/antekera/ncol-next/pull/315). El Goal, el plan, las pruebas y la aceptación mantienen obligatorios **dataLayer existente, rendimiento Next.js/CWV y limpieza segura**. El Home público todavía sirve la versión anterior. La decisión vigente del 18/10/2026 es lanzamiento directo de V2, sin A/B; no se ha ejecutado el despliegue. **Esta entrega no completa el Goal ni está lista para merge/activación.**

| Fase | Resultado concreto | Estado/límite |
|---|---|---|
| 1. Auditoría de código, arquitectura y medición | Infraestructura, eventos, GTM publicado auditado, consentimiento/persistencia y consumidores inventariados | Señal/política pública de consentimiento sin confirmar |
| 2. Línea base | Lighthouse anterior, CrUX histórico del control, bundles, imágenes, requests, queries y caché | Campo histórico no atribuible a esta rama/V2 |
| 3. Arquitectura modular | Configuración tipada, composición de servidor, taxonomías y POST compartidos | Implementado y probado localmente |
| 4. Componentes reutilizables | Apertura, tarjetas/secciones, filtros, ranking/opinión/servicios/videos | Implementado; preferencias editoriales móviles conservan todas las secciones |
| 5. Dos aperturas automáticas | Fotográfica/tradicional; dimensiones, fallbacks y recursos responsivos | Probadas en tres motores, nueve anchos y densidades pertinentes |
| 6. dataLayer | Misma utilidad/transporte; vista/impresiones/clic y CWV públicos preparados con `home_version`, sin campos A/B; entorno/navegación de métricas verificados; lectura/segunda noticia y origen adaptados al mismo contrato | Publicación, recepción/duplicados GTM/GA4 y permiso/sesión de lectura pública pendientes |
| 7. Sidebar, anuncios y especializados | Slots/IDs existentes, reservas, sticky, BCV, opinión y YouTube | Player ID propio de Dailymotion no disponible; se conserva fallback |
| 8. Datos/imágenes/renderizado | Caché Next real, recuperación parcial, dos POST del núcleo, optimizador/sizes; 160 corridas (80 activas/80 referencia) | Cuatro alertas temporales justificadas para revisión local; campo/configuración GTM completa sin aprobar |
| 9. Código muerto | Dos consultas literales huérfanas retiradas; Knip y uso real contrastados | Control/internas preservados; candidatos y limpieza posterior a estabilizar lanzamiento documentados |
| 10. Lanzamiento directo y caché | Montaje de una sola V2 en `/`, selección por build y rollback preparados, apagados; ISR temporal y navegación probados localmente | Tag público propio y actualización en segundo plano conservan respaldo en las pruebas de publicación/fallo; faltan coordinación HTML/datos con los lotes, madrugada, límites editoriales, analítica pública y validación desplegada; coordinador 30/60 min y copia SQL preparados localmente con flag apagado; perfil HTML diurno/nocturno y vencimientos preparado localmente; urgencias/planificador pendientes |
| 11. Validación | 1.028 unitarias/15 snapshots; snapshot compartido entre días con CMS caído y reinicio, dos puertas de vencimiento del lector sin HTTP, reserva del carrusel sin salto y eventos públicos sin A/B; seis recorridos nativos CWV históricos y 24 nuevos E2E de caché durable/lanzamiento/rollback; matrices anteriores conservan su revisión | Perfil HTML local diurno/nocturno y límites ordinarios verificados, incluida primera RSC; urgencias/recuperación, recepción remota, WordPress/CDN real y campo V2 siguen pendientes |
| 12. Documentación/PR/entrega | Informes consolidados, revisión completa y defectos corregidos, PR borrador adjunto | Entrega revisable; Goal y merge pendientes |

La revisión completa encontró dos defectos importantes y ninguno crítico/menor adicional. Ambos tienen regresión RED/verde: texto sin miniatura y origen perdido antes del import diferido. Revisión, decisiones y pruebas. Un fallo posterior de CI reveló dependencia de `.env` en el fixture publicitario; se corrigió usando valores ficticios y el hook real, con CI remoto verde.

Los [resultados finales de rendimiento](performance.md) mantienen separadas mejoras, costes y cuatro alertas: TBT móvil frío y LCP caliente de foto, y LCP del sticky en tradicional con titular corto móvil. Las decisiones locales no equivalen a autorización de lanzamiento ni a cumplimiento de p75 real. No se ocultó publicidad ni se alteró el contenido para cambiar candidatos.

## Aceptación adicional del lanzamiento directo

- [ ] `/` sirve una única Home V2 cacheable con tratamiento automático, sin doble apertura QA, cohortes ni exposición A/B.
- [ ] Cola global de publicaciones y tags separados limitan lotes de Home sin retrasar el acceso directo al artículo; horario/ventana revisados antes de activar; código local provisional detrás del flag apagado.
- [x] Preparación local de HTML nocturno: sin regeneración de cinco minutos, publicación nocturna y vuelta al día verificadas en Next real.
- [ ] Validación desplegada de esos plazos y recuperación del planificador verificadas; el fixture local no sustituye esta puerta.
- [ ] HTML/RSC cacheados respetan medianoche Caracas, destacadas de 24 h y retiradas urgentes; errores CMS conservan último contenido válido con reintentos acotados.
- [x] Datos editoriales compartidos entre días: sin consulta adicional por medianoche, títulos vencidos excluidos y copia sana reutilizada durante fallo CMS, incluso tras reiniciar Next. Prueba local de caché persistente; no cierra el criterio completo de HTML anterior.
- [ ] Opinión, taxonomías y regiones analizadas junto con invocaciones, requests WordPress, hits y transferencia; ninguna regresión de categorías, artículos, anuncios o dataLayer.
- [x] Transporte regional público preparado y probado localmente: GET compartible, sin cookies/Action/polling, vigencia acotada y errores no cacheables; preview conserva su Action. HIT e invocaciones desplegados siguen pendientes en el criterio anterior.
- [ ] Rollback preparado y verificado; laboratorio actualizado antes del lanzamiento y seguimiento de campo posterior separados.

Las puertas `--deadline=feature|midnight` pasan para el lector hidratado, con estados editoriales preparados y cero solicitudes al vencer. No aprueban por sí solas la regeneración global del HTML, lotes, madrugada ni retiradas urgentes; el criterio completo permanece pendiente. Ver [protocolo y coste](performance.md#vencimiento-editorial-del-lector-23102026).

El prototipo inicial de expiración omitía el caché de datos sano y devolvía 500 con WordPress caído. El perfil nuevo usa la copia SQL durable y las puertas de medianoche/24 h pasan sin consultas CMS; se conserva apagado por defecto, sin dar por cerradas urgencias, almacenamiento o CDN. La preparación pública de CWV sí usa el hook existente, con entorno de servidor y muestras nativas verificadas; [resultados y límites](performance.md#preparación-pública-de-cwv-23102026). Esto prepara el seguimiento posterior, sin acreditar recepción remota ni p75 real.

La política propuesta está en [rendimiento](performance.md#lanzamiento-directo-y-caché-propuesta-18102026). La [preparación del 23/10](performance.md#preparación-pública-verificada-23102026-sin-activación) añade código y pruebas locales de montaje, rollback y bundles; las casillas de lanzamiento conservan los pendientes reales. No se reetiquetan las pruebas históricas como resultados de este build.

La copia durable y el coordinador ya tienen integración optativa local: diez publicaciones/veinte propietarios, copia sana durante fallo y cero consultas de origen en veinte HIT. Esto cierra la preparación del cliente/coordinador, no el lanzamiento: quedan urgencias/CDN y validación desplegada de HTML/madrugada, recuperación de entrega diferida y publicador/almacenamiento, prewarm/migración remota, planificador y validación desplegada. No se han cambiado flags ni datos productivos.

## Información necesaria para continuar

1. **Consentimiento y persistencia existentes:** señal concreta y política aplicable para medición y lectura. No se requieren cohortes. No se infieren de cookies GA4 ni de los flags QA. La medición pública sigue requiriendo esta validación; ya no hay selector experimental que preparar.
2. **GTM/GA4:** completar la validación del workspace/configuración y recepción/deduplicación real, fuente de sesiones/lectura/retorno e ingresos/viewability. El borrador propio continúa offline/pausado; importación/publicación y cualquier consentimiento/condición de la cuenta requieren su paso autorizado correspondiente.
3. **Dailymotion:** Player ID de la cuenta para confirmar reproducción mediante la integración del proveedor. No se inventa un ID ni se sustituye la integración heredada sin ese dato.

La selección móvil de la referencia sigue siendo una preferencia editorial pendiente; se conserva el contenido actual y no se usa esa pregunta opcional como único motivo de bloqueo. En fase 10 deberán verificarse caché y rollback en Vercel, hosting observado en producción. La muestra de campo V2 y los resultados posteriores al lanzamiento solo podrán evaluarse cuando existan; no se fabrican ni se exige activar tráfico para aparentar cierre local.

Las preguntas de consentimiento/Player ID ya están solicitadas. No hay autorización implícita por tiempo transcurrido. No se desplegó, activó A/B, escribió al CMS, invalidó CloudFront ni importó/publicó GTM.

Actualización de vista previa: **794 unitarias/15 snapshots** tras cinco regresiones del hook de autores y comprobación WebKit móvil HTTPS/401 simulado en V2 y control. Corrección, alcance y límites. Los 148 E2E y 160 Lighthouse anteriores conservan la revisión previa; no se vuelven a etiquetar como mediciones del guard de errores.

Corrección editorial (18/10/2026): la caducidad depende de fechas explícitas vencidas en el **título**, no de la fecha de publicación. Noticias antiguas sin fecha en título permanecen; fechas futuras/rangos no caducan antes de su último día. Se retiran filtros de publicación en WordPress, ranking y regiones. Se conservan las restricciones de apertura, las guardas A/B y las dependencias públicas pendientes. Las pruebas deben cubrir expresamente esta distinción, caché y cambio de día; el ajuste no completa el Goal.

Prueba local de esta corrección: 847 unitarias/15 snapshots, lint/tipos/build, caché Next real y 42 E2E pasan, con tres guardas de build normal omitidas expresamente en QA. La comparación Lighthouse y el campo mantienen sus límites anteriores; no se activa el experimento.
