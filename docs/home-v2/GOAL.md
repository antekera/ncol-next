# Goal: NoticiasCol Home V2

Estado: activo; planificación, auditorías, baseline, componentes modulares y adaptadores analíticos locales en desarrollo desde el 17 de octubre de 2026. La validación pública, el cierre de rendimiento y la preparación del lanzamiento directo siguen pendientes; consultar el [estado vigente](progress.md). Rama inicial: `feat/home-v2-plan`, desde `origin/main` (`873645e117a061db8fbe500493eaf6742b5d8c7a`). No había un Goal activo ni un plan previo de Home V2 en este repositorio al iniciar esta tarea.

Implementar una portada editorial modular, responsive y mantenible basada en la referencia adjunta, con dos tratamientos automáticos de apertura —fotográfico y tradicional— para sustituir directamente el Home actual en producción, sin experimento A/B (decisión del 18/10/2026). **La instrumentación analítica mediante el dataLayer existente, la optimización de Next.js y Core Web Vitals, y la auditoría y eliminación segura de código muerto son requisitos obligatorios y transversales.** Preservar el comportamiento del Home actual y las páginas internas hasta autorizar el cambio definitivo.

## Alcance editorial

La referencia visual guía jerarquía, densidad y adaptación móvil/escritorio: apertura y noticias secundarias, Todo Zulia con filtros regionales, Nacionales, Sucesos, Internacionales, Videos recientes, Deportes, Tendencias, Entretenimiento, últimas publicaciones y sidebar de dólar BCV, ranking, opinión, servicios y publicidad. Los datos son editoriales reales de WordPress; los textos y cifras de la imagen no son fixtures de producción. Conservar navegación, accesibilidad, SEO y funcionalidades compartidas.

Los tratamientos fotográfico/tradicional pertenecen a V2 y se seleccionan automáticamente. No habrá variantes de tráfico, cohortes ni cookies de asignación. La apertura fotográfica superpone categoría, titular y resumen blancos a una foto de fondo con degradado oscuro cuando WordPress confirma al menos 1200 × 600 px. Comparte el umbral de ancho de categorías y añade una altura mínima para descartar franjas panorámicas. Con dimensiones insuficientes, ausentes o inválidas conserva imagen y texto separados; sin imagen conserva el fallback tradicional. La selección es determinista en servidor, sin consultas por tarjeta ni descarga de imágenes para inspeccionarlas. Una imagen fallida debe cambiar al tratamiento tradicional manteniendo la reserva inicial y registrando el tratamiento efectivamente mostrado sin otra vista.

La apertura admite Sucesos, Nacionales y Zulia (incluidas sus categorías descendientes), o cualquier categoría con `customFields.noticiadestacada === true` durante las primeras 24 horas desde su publicación original. Al cumplir 24 horas, la marca pierde prioridad y la excepción por categoría; la noticia puede seleccionarse por las reglas ordinarias si pertenece a una categoría permitida. Se usa el instante de publicación de WordPress, interpretando fechas sin offset como Venezuela; una fecha ausente, inválida o futura no concede prioridad manual. Se reevalúa tras caché y al vencer en una pestaña abierta. Inameh, su escritura con guiones y dólar/dolar se excluyen de toda la apertura incluso con marca manual. En todos los listados de V2, incluidos videos, ranking, opinión y regiones, una fecha explícita en el **título** determina la vigencia: se excluye al pasar esa fecha según Venezuela (`America/Caracas`). Los títulos sin fecha explícita siguen siendo elegibles independientemente de la fecha de publicación. Las fechas futuras y los rangos siguen vigentes hasta su último día. La marca manual no evita la caducidad explícita del título. Servicios, tasas y anuncios mantienen sus integraciones.

## Condiciones obligatorias

- Reutilizar `src/lib/utils/ga.ts`, `GA_EVENTS`, `GAPageView` y `GAEvent`. No agregar otra integración GA4/GTM ni otro transporte analítico.
- Auditar eventos, payloads, GTM/GA4, consentimiento, navegación y duplicación **antes** de introducir eventos. La configuración remota no se deduce del código.
- Atribuir exposición, impresiones y clics a la versión de Home desplegada, módulo, posición editorial, artículo cuando aplique y tipo de presentación; no emitir exposición experimental ni asignar cohortes. Registrar también tratamiento de apertura de V2.
- Usar `home_version` como versión editorial; retirar `experiment_id`/`home_variant` de los eventos y del mapping propuesto. La marca pública procede del build/servidor, nunca de una query ni de asignación de tráfico. Conservar los permisos de lectura y la validación remota como requisitos separados.
- Medir impresiones visibles de módulos y tarjetas; no confundir precarga con exposición. Prevenir duplicación por hidratación, rerenders, filtros, navegación y montaje responsive.
- Medir segunda noticia distinta en la misma sesión y lectura posterior en destino. Scroll es diagnóstico, no objetivo principal. No enviar PII ni crear identificadores personales nuevos.
- Levantar línea base antes de implementar componentes, y comparar ambas portadas en condiciones equivalentes en móvil/escritorio. Objetivos p75 de campo: **LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1**. Laboratorio y campo se reportan por separado; la falta de muestra nunca equivale a aprobar.
- Optimizar datos, taxonomías, imágenes, renderizado, hidratación, bundles, fuentes y scripts durante cada fase; evitar solicitudes redundantes y preservar frescura editorial, anuncios e identificadores existentes.
- Compartir el snapshot editorial entre días y aplicar la elegibilidad después del caché, sin consultas provocadas únicamente por medianoche ni pérdida de una copia sana ante fallos del CMS. Verificar persistencia real; esto no sustituye los requisitos de HTML, lotes y madrugada del lanzamiento.
- Auditar código muerto con análisis estático y revisión del uso real. No borrar por un reporte automático. Proteger rutas dinámicas, configuración, imports dinámicos, hooks indirectos, scripts, analítica, anuncios, categorías y componentes heredados necesarios para rollback.
- Separar limpieza segura durante el desarrollo de limpieza después de estabilizar el lanzamiento directo y revisar la necesidad de rollback. Cambios extensos ajenos a Home V2 van a un trabajo separado.
- **No implementar ni activar A/B.** Preparar una única Home V2 pública con HTML cacheable, sin trasladar el `force-dynamic` de la preview a producción. La decisión define la estrategia de lanzamiento; este ajuste de planificación no ejecuta el despliegue.

## Caché y coste de producción

Reutilizar el circuito de publicación de WordPress, con agrupación global de invalidaciones y tags separados para Home, artículos, categorías y regiones. Aumentar solo el TTL no limita invalidaciones explícitas. Conservar HTML y datos compartidos entre visitantes; nada de polling editorial por visitante ni consultas por tarjeta.

Propuesta para revisar antes de implementar: lotes editoriales de 30 minutos durante el día; entre 00:00 y 06:00 `America/Caracas`, conservar caché hasta 6 horas como respaldo si no hay novedades. Los horarios/valores todavía no están aprobados. Una publicación nocturna debe entrar en la siguiente ventana ordinaria de 30 minutos sin esperar seis horas. Retiradas urgentes y vencimientos editoriales requieren una vía controlada independiente. Reutilizar el último snapshot válido ante fallos del CMS, con reintentos acotados.

Son aceptación obligatoria las pruebas de diez publicaciones agrupadas, visitas repetidas sin nuevas consultas editoriales dentro de una ventana, noche sin publicaciones, publicación nocturna, reanudación diurna, medianoche de Venezuela, destacada de 24 horas y recuperación sin caché vacía. Registrar invocaciones, consultas, hits y regeneraciones; no prometer ahorro monetario sin datos reales. Ver [política propuesta y validación](performance.md#lanzamiento-directo-y-caché-propuesta-18102026).

## Fases obligatorias

1. Auditoría del código, arquitectura y medición existentes.
2. Línea base de rendimiento.
3. Arquitectura editorial modular y configuración de secciones.
4. Implementación de los componentes reutilizables.
5. Adaptación de las dos variantes automáticas de portada.
6. Integración con el dataLayer existente.
7. Sidebar, publicidad y módulos especializados.
8. Optimización de datos, imágenes y renderizado.
9. Identificación y limpieza segura de código muerto.
10. Preparación y pruebas del lanzamiento directo, caché y rollback.
11. Validación analítica, funcional, visual y de rendimiento.
12. Documentación, Pull Request y entrega.

Las fases ordenan entregables; analítica, rendimiento y limpieza se revisan en cada componente desde la fase 3. La fase 6 consolida contratos definidos en la fase 1; la fase 8 verifica presupuestos fijados en la fase 2; la fase 9 ejecuta eliminaciones respaldadas por evidencia.

## Métricas de éxito, en orden

1. CTR de módulo = exposiciones visibles del módulo con al menos un clic editorial / exposiciones visibles del módulo. Desglosar por versión desplegada, módulo, posición y tratamiento; acompañar de CTR de tarjeta, sin mezclar denominadores.
2. Sesiones expuestas con dos o más artículos distintos realmente abiertos / sesiones expuestas con al menos un artículo abierto. Reportar también sobre todas las sesiones expuestas.
3. Engagement y lectura en destino asociados al clic de origen.
4. Retorno de lectores con la identidad y consentimiento existentes en GA4; no crear identificación propia.
5. Ingresos y visibilidad publicitaria con fuentes publicitarias existentes, sin convertir impresiones editoriales en impresiones publicitarias.
6. Core Web Vitals por dispositivo y versión desplegada cuando haya muestra de campo suficiente.

Comparar laboratorio con la línea base del Home anterior y observar campo/negocio antes y después del lanzamiento, fechando versiones y ventanas. No atribuir causalidad a una comparación temporal ni exigir resultados V2 de campo antes de que exista tráfico real. El seguimiento de campo sigue siendo obligatorio para cerrar el Goal.

## Pruebas y evidencia

| Eje                | Evidencia exigida                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Analítica          | Jest de compatibilidad/deduplicación/visibilidad/sesión; E2E de V2, filtros y destino, más compatibilidad de rollback; capturas del dataLayer y validación GTM Preview/GA4 DebugView        |
| Rendimiento        | Línea base y comparación Lighthouse móvil/escritorio, HAR y trazas, bundles, consultas WordPress con duración, imágenes, caché, anuncios y datos de campo disponibles |
| Limpieza           | Reportes Knip revisados, búsqueda de referencias e indirectos por candidato, lista de cambios, unitarias, tipos, lint, build y E2E del control y páginas internas     |
| Editorial y visual | Fixtures deterministas de ambos tratamientos, imágenes faltantes, módulos vacíos/error, filtros/taxonomías, navegación por teclado y screenshots móvil/escritorio     |
| Lanzamiento directo | Una sola Home pública, sin cohortes ni exposición A/B; caché HTML/datos, publicaciones agrupadas, madrugada, límites editoriales, recuperación y rollback |

## Criterios de aceptación

Solo se marcan criterios con evidencia verificable; completar los documentos o la capa de datos no completa Home V2.

- [x] El Home V2 utiliza exclusivamente `GAEvent`/dataLayer existentes; montaje local verificado, sin nuevo transporte. [Contrato y pruebas](analytics.md). La recepción remota sigue pendiente en el criterio siguiente.
- [ ] Los eventos no están duplicados, incluyendo GTM/GA4 y vistas virtuales de artículos.
- [x] Los clics llevan módulo, posición, componente y artículo cuando corresponde; control/V2 verificados en tres motores. [Módulos](analytics.md), [opinión](analytics.md).
- [x] Las impresiones exigen exposición real, tamaño válido, foco/visibilidad y ausencia de oclusión durante el intervalo definido; se prueban rerenders/filtros y contenido tardío. [Reglas y cobertura](analytics.md). No se equiparan a impresiones publicitarias.
- [ ] La medición pública identifica Home V2, módulo y tratamiento fotográfico/tradicional sin cohortes ni eventos de experimento.
- [ ] La apertura de una segunda noticia distinta puede medirse dentro de la misma sesión.
- [ ] La lectura en destino, retorno y métricas publicitarias tienen fuente y validación documentadas, sin PII.
- [x] Existe una línea base de laboratorio del control anterior a los cambios y CrUX del Home público histórico por URL/dispositivo/ventana, con p75 real. [Laboratorio](performance.md), [campo del control](performance.md). El campo de V2 permanece pendiente.
- [x] Home V2 tiene resultados comparativos de Lighthouse disponibles: 80 corridas con productor Home activo y 80 de referencia, ambas variantes/dispositivos. Los CWV de campo disponibles del control están fechados; V2 no tiene muestra y no queda aprobado en campo. [Comparación, alertas y límites](performance.md).
- [x] Se analizaron bundles, consultas WordPress y carga de imágenes: grafo inicial/cacheado, campos y solicitudes compartidas, tamaños responsive y descarga diferida. [Resultados y límites](performance.md). La aprobación comparativa final conserva su criterio separado.
- [x] El contenido editorial modular comparte taxonomías y un POST para sus diez módulos y la selección independiente de destacadas; los consumidores de un render y los hits no repiten consultas. [Prueba con caché Next real y límites](performance.md); [consulta real y campos](performance.md). No certifica CDN ni carga de producción.
- [ ] Se cumplen los presupuestos comparativos; cualquier regresión significativa está resuelta o justificada explícitamente con evidencia.
- [x] Se realizó una auditoría de código muerto del alcance Home V2 y se clasificaron candidatos heredados/ajenos para revisión separada. [Informe](dead-code-audit.md).
- [x] El código eliminado está verificado y cubierto por pruebas apropiadas: dos consultas literales sin consumidores, build/lint y 634 tests pasan.
- [x] La limpieza conserva Home actual y páginas internas: navegación real por control/categoría/artículo, 18 E2E en tres motores pasan.
- [ ] El lanzamiento directo sirve Home V2 en `/` con una única respuesta cacheable, sin comparación doble de QA ni asignación A/B; rollback al Home anterior probado. Hoy `/` todavía sirve el Home anterior.
- [x] Existe documentación para continuar la limpieza después de estabilizar el lanzamiento. [Lista y preservados](dead-code-audit.md#después-del-lanzamiento).
- [x] Elegibilidad editorial de V2: categorías/descendientes o marca booleana durante 24 horas desde publicación; tras vencer, sin prioridad ni excepción por categoría, también desde caché y en pestañas abiertas. Exclusión Inameh/dólar en apertura y vigencia de fechas explícitas en títulos de todos los listados, conservando publicaciones anteriores sin fecha en el título. Regresiones deterministas y consulta real de WordPress verificadas; ver [estado](progress.md).
- [ ] Ambas aperturas automáticas, módulos, sidebar sticky, anuncios y adaptación responsive cumplen la referencia y las pruebas funcionales/visuales.
- [x] [PR borrador #315](https://github.com/antekera/ncol-next/pull/315) con informes consolidados, pruebas, riesgos, rollout y rollback; entrega revisable. No equivale a merge ni a completar el Goal.

## Documentos de trabajo

- [Plan de implementación](../superpowers/plans/2026-10-17-home-v2.md).
- [Mapa de eventos y validación](analytics.md).
- [Línea base y protocolo comparativo](performance.md).
- [Auditoría y limpieza segura](dead-code-audit.md).
- [Referencia visual](reference.jpg).
- [Estado de ejecución y próximos pasos](progress.md).

El montaje local de Web Vitals reutiliza el dataLayer y conserva atribución a navegación/variante/tratamiento. [Evidencia y límites](analytics.md). No cierra la aceptación de campo: sus eventos están marcados `local-qa`, sin muestra real V2 ni activación pública.

El ranking ya dispone de identidad pública acotada, unión con ID WordPress de destino y pruebas locales de segunda noticia. [Evidencia y alcance](analytics.md). No cierra por sí solo consentimiento, atribución pública a Home V2 ni recepción remota; esos criterios conservan su estado pendiente.

El [estado por fases y las dependencias pendientes](acceptance.md) separan el cierre local de la preparación pública aún incompleta. Las cuatro alertas temporales de rendimiento tienen evaluación y justificación local explícitas; no se marca aprobación de lanzamiento o de campo. El productor no es un transporte paralelo y el borrador GTM propio continúa offline/pausado.
