# Entrega local y aceptación pendiente

Rama `feat/home-v2-plan`; [PR borrador #315](https://github.com/antekera/ncol-next/pull/315). El Goal, el plan, las pruebas y la aceptación mantienen obligatorios **dataLayer existente, rendimiento Next.js/CWV y limpieza segura**. El Home público sigue siendo el control. **Esta entrega no completa el Goal ni está lista para merge/activación.**

| Fase | Resultado concreto | Estado/límite |
|---|---|---|
| 1. Auditoría de código, arquitectura y medición | Infraestructura, eventos, GTM publicado auditado, consentimiento/persistencia y consumidores inventariados | Señal/política pública de consentimiento sin confirmar |
| 2. Línea base | Lighthouse anterior, CrUX histórico del control, bundles, imágenes, requests, queries y caché | Campo histórico no atribuible a esta rama/V2 |
| 3. Arquitectura modular | Configuración tipada, composición de servidor, taxonomías y POST compartidos | Implementado y probado localmente |
| 4. Componentes reutilizables | Apertura, tarjetas/secciones, filtros, ranking/opinión/servicios/videos | Implementado; preferencias editoriales móviles conservan todas las secciones |
| 5. Dos aperturas automáticas | Fotográfica/tradicional; dimensiones, fallbacks y recursos responsivos | Probadas en tres motores, nueve anchos y densidades pertinentes |
| 6. dataLayer | Misma utilidad/transporte; visibilidad, clic/contexto, lectura y segunda noticia; origen antes de navegar | Productor QA probado; recepción/duplicados GTM/GA4 y sesión pública pendientes |
| 7. Sidebar, anuncios y especializados | Slots/IDs existentes, reservas, sticky, BCV, opinión y YouTube | Player ID propio de Dailymotion no disponible; se conserva fallback |
| 8. Datos/imágenes/renderizado | Caché Next real, recuperación parcial, dos POST del núcleo, optimizador/sizes; 160 corridas (80 activas/80 referencia) | Cuatro alertas temporales justificadas para revisión local; campo/configuración GTM completa sin aprobar |
| 9. Código muerto | Dos consultas literales huérfanas retiradas; Knip y uso real contrastados | Control/internas preservados; candidatos y limpieza pos-A/B documentados |
| 10. Preparación pública A/B | Guardas QA, protocolo de aislamiento/rollback y control público conservado | **Selector/cohortes/flag público y adaptación de consentimiento/caché todavía no implementados**; necesitan la política de persistencia existente |
| 11. Validación | 789 unitarias/15 snapshots; 148 E2E aprobados y dos omisiones cronometradas; lint/tipos/build y CI | No acredita recepción remota, publicación WP/CDN real, resultados de negocio o campo V2 |
| 12. Documentación/PR/entrega | Informes, evidencia por revisión, revisión completa y defectos corregidos, PR borrador adjunto | Entrega revisable; Goal y merge pendientes |

La revisión completa encontró dos defectos importantes y ninguno crítico/menor adicional. Ambos tienen regresión RED/verde: texto sin miniatura y origen perdido antes del import diferido. [Revisión, decisiones y pruebas](evidence/review/whole-branch.md). Un fallo posterior de CI reveló dependencia de `.env` en el fixture publicitario; se corrigió usando valores ficticios y el hook real, con [CI remoto verde](evidence/review/ci-fixture.md).

Los [resultados finales de rendimiento](evidence/performance/final-6601bb1/verification.md) mantienen separadas mejoras, costes y cuatro alertas: TBT móvil frío y LCP caliente de foto, y LCP del sticky en tradicional con titular corto móvil. Las decisiones locales no equivalen a autorización de lanzamiento ni a cumplimiento de p75 real. No se ocultó publicidad ni se alteró el contenido para cambiar candidatos.

## Información necesaria para continuar

1. **Consentimiento y persistencia existentes:** señal concreta y política aplicable para asignar/persistir cohortes y coordinar lectura. No se infieren de cookies GA4 ni de los flags QA. La implementación pública de fase 10 depende de esta decisión; no está simplemente esperando encender un flag terminado.
2. **GTM/GA4:** completar la validación del workspace/configuración y recepción/deduplicación real, fuente de sesiones/lectura/retorno e ingresos/viewability. El borrador propio continúa offline/pausado; importación/publicación y cualquier consentimiento/condición de la cuenta requieren su paso autorizado correspondiente.
3. **Dailymotion:** Player ID de la cuenta para confirmar reproducción mediante la integración del proveedor. No se inventa un ID ni se sustituye la integración heredada sin ese dato.

La selección móvil de la referencia sigue siendo una preferencia editorial pendiente; se conserva el contenido actual y no se usa esa pregunta opcional como único motivo de bloqueo. Después de completar fase 10 deberán verificarse aislamiento y rollback desplegados de SST/OpenNext/CloudFront, antes de cualquier distribución autorizada. La muestra de campo V2 y los resultados del experimento solo podrán evaluarse cuando existan; no se fabrican ni se exige activar tráfico para aparentar cierre local.

Las preguntas de consentimiento/Player ID ya están solicitadas. No hay autorización implícita por tiempo transcurrido. No se desplegó, activó A/B, escribió al CMS, invalidó CloudFront ni importó/publicó GTM.
