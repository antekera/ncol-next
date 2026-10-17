# Goal: NoticiasCol Home V2

Estado: activo; planificación, auditoría inicial, baseline de laboratorio y capa editorial de datos incorporadas el 17 de octubre de 2026. Componentes, instrumentación nueva, A/B y aceptación pendientes. Rama inicial: `feat/home-v2-plan`, desde `origin/main` (`873645e117a061db8fbe500493eaf6742b5d8c7a`). No había un Goal activo ni un plan previo de Home V2 en este repositorio al iniciar esta tarea.

Implementar una portada editorial modular, responsive y mantenible basada en la referencia adjunta, con dos tratamientos automáticos de apertura —fotográfico y tradicional— y un experimento entre Home actual y Home V2. **La instrumentación analítica mediante el dataLayer existente, la optimización de Next.js y Core Web Vitals, y la auditoría y eliminación segura de código muerto son requisitos obligatorios y transversales.** Preservar el comportamiento del Home actual y las páginas internas hasta autorizar el cambio definitivo.

## Alcance editorial

La referencia visual guía jerarquía, densidad y adaptación móvil/escritorio: apertura y noticias secundarias, Todo Zulia con filtros regionales, Nacionales, Sucesos, Internacionales, Videos recientes, Deportes, Tendencias, Entretenimiento, últimas publicaciones y sidebar de dólar BCV, ranking, opinión, servicios y publicidad. Los datos son editoriales reales de WordPress; los textos y cifras de la imagen no son fixtures de producción. Conservar navegación, accesibilidad, SEO y funcionalidades compartidas.

Los tratamientos fotográfico/tradicional pertenecen a V2; no son las variantes A/B. La variante A es el Home actual y la B es Home V2. La selección automática del tratamiento debe ser determinista, documentada y probada; una imagen ausente o fallida debe tener fallback sin salto de layout.

## Condiciones obligatorias

- Reutilizar `src/lib/utils/ga.ts`, `GA_EVENTS`, `GAPageView` y `GAEvent`. No agregar otra integración GA4/GTM ni otro transporte analítico.
- Auditar eventos, payloads, GTM/GA4, consentimiento, navegación y duplicación **antes** de introducir eventos. La configuración remota no se deduce del código.
- Atribuir exposición, impresiones y clics al experimento, variante, módulo, posición editorial, artículo cuando aplique y tipo de presentación. Registrar también tratamiento de apertura de V2.
- Medir impresiones visibles de módulos y tarjetas; no confundir precarga con exposición. Prevenir duplicación por hidratación, rerenders, filtros, navegación y montaje responsive.
- Medir segunda noticia distinta en la misma sesión y lectura posterior en destino. Scroll es diagnóstico, no objetivo principal. No enviar PII ni crear identificadores personales nuevos.
- Levantar línea base antes de implementar componentes, y comparar ambas portadas en condiciones equivalentes en móvil/escritorio. Objetivos p75 de campo: **LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1**. Laboratorio y campo se reportan por separado; la falta de muestra nunca equivale a aprobar.
- Optimizar datos, taxonomías, imágenes, renderizado, hidratación, bundles, fuentes y scripts durante cada fase; evitar solicitudes redundantes y preservar frescura editorial, anuncios e identificadores existentes.
- Auditar código muerto con análisis estático y revisión del uso real. No borrar por un reporte automático. Proteger rutas dinámicas, configuración, imports dinámicos, hooks indirectos, scripts, analítica, anuncios, categorías y componentes del control.
- Separar limpieza segura durante el desarrollo de limpieza después del A/B. Cambios extensos ajenos a Home V2 van a un trabajo separado.
- **El experimento A/B permanece desactivado hasta autorización explícita.** Previews de QA no reparten tráfico real. Publicar una rama o PR no autoriza activación ni despliegue productivo.

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
10. Preparación y pruebas del experimento A/B.
11. Validación analítica, funcional, visual y de rendimiento.
12. Documentación, Pull Request y entrega.

Las fases ordenan entregables; analítica, rendimiento y limpieza se revisan en cada componente desde la fase 3. La fase 6 consolida contratos definidos en la fase 1; la fase 8 verifica presupuestos fijados en la fase 2; la fase 9 ejecuta eliminaciones respaldadas por evidencia.

## Métricas de éxito, en orden

1. CTR de módulo = exposiciones visibles del módulo con al menos un clic editorial / exposiciones visibles del módulo. Desglosar por variante, módulo, posición y tratamiento; acompañar de CTR de tarjeta, sin mezclar denominadores.
2. Sesiones expuestas con dos o más artículos distintos realmente abiertos / sesiones expuestas con al menos un artículo abierto. Reportar también sobre todas las sesiones expuestas.
3. Engagement y lectura en destino asociados al clic de origen.
4. Retorno de lectores con la identidad y consentimiento existentes en GA4; no crear identificación propia.
5. Ingresos y visibilidad publicitaria con fuentes publicitarias existentes, sin convertir impresiones editoriales en impresiones publicitarias.
6. Core Web Vitals por dispositivo y variante cuando haya muestra de campo suficiente.

El tamaño de muestra, duración y criterio de decisión se registran antes de activar el A/B. No decidir por scroll ni por diferencias de pocos eventos.

## Pruebas y evidencia

| Eje                | Evidencia exigida                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Analítica          | Jest de compatibilidad/deduplicación/visibilidad/sesión; E2E de ambos grupos, filtros y destino; capturas del dataLayer y validación GTM Preview/GA4 DebugView        |
| Rendimiento        | Línea base y comparación Lighthouse móvil/escritorio, HAR y trazas, bundles, consultas WordPress con duración, imágenes, caché, anuncios y datos de campo disponibles |
| Limpieza           | Reportes Knip revisados, búsqueda de referencias e indirectos por candidato, lista de cambios, unitarias, tipos, lint, build y E2E del control y páginas internas     |
| Editorial y visual | Fixtures deterministas de ambos tratamientos, imágenes faltantes, módulos vacíos/error, filtros/taxonomías, navegación por teclado y screenshots móvil/escritorio     |
| A/B                | Flag apagado por defecto, asignación estable y sin parpadeo, exclusión de QA/bots, aislamiento de caché, rollback y ausencia de exposición cuando está apagado        |

## Criterios de aceptación

Solo se marcan criterios con evidencia verificable; completar los documentos o la capa de datos no completa Home V2.

- [ ] El Home V2 utiliza el dataLayer existente.
- [ ] Los eventos no están duplicados, incluyendo GTM/GA4 y vistas virtuales de artículos.
- [ ] Los clics están asociados al módulo editorial correspondiente.
- [ ] Las impresiones representan contenido realmente visible.
- [ ] La atribución A/B funciona para control y V2 y distingue tratamiento fotográfico/tradicional.
- [ ] La apertura de una segunda noticia distinta puede medirse dentro de la misma sesión.
- [ ] La lectura en destino, retorno y métricas publicitarias tienen fuente y validación documentadas, sin PII.
- [x] Existe una línea base de laboratorio del control anterior a los cambios y CrUX del Home público histórico por URL/dispositivo/ventana, con p75 real. [Laboratorio](evidence/performance/control/summary.json), [campo del control](evidence/performance/field/crux-control-2026-10-17.json). El campo de V2 permanece pendiente.
- [ ] Home V2 tiene resultados comparativos de Lighthouse y Core Web Vitals disponibles; los datos de campo insuficientes figuran como pendientes y no como aprobación.
- [ ] Se analizaron bundles, consultas WordPress y carga de imágenes.
- [ ] El contenido modular no introduce solicitudes redundantes importantes.
- [ ] Se cumplen los presupuestos comparativos; cualquier regresión significativa está resuelta o justificada explícitamente con evidencia.
- [x] Se realizó una auditoría de código muerto del alcance Home V2 y se clasificaron candidatos heredados/ajenos para revisión separada. [Informe](dead-code-audit.md).
- [x] El código eliminado está verificado y cubierto por pruebas apropiadas: dos consultas literales sin consumidores, build/lint y 634 tests pasan.
- [x] La limpieza conserva Home actual y páginas internas: navegación real por control/categoría/artículo, 18 E2E en tres motores pasan.
- [ ] El experimento A/B permanece desactivado hasta recibir autorización.
- [x] Existe documentación para continuar la limpieza cuando finalice el experimento. [Lista y preservados](dead-code-audit.md#después-del-experimento).
- [ ] Ambas aperturas automáticas, módulos, sidebar sticky, anuncios y adaptación responsive cumplen la referencia y las pruebas funcionales/visuales.
- [ ] Pull Request con informes, pruebas, riesgos, rollout y rollback; entrega revisable.

## Documentos de trabajo

- [Plan de implementación](../superpowers/plans/2026-10-17-home-v2.md).
- [Mapa de eventos y validación](analytics.md).
- [Línea base y protocolo comparativo](performance.md).
- [Auditoría y limpieza segura](dead-code-audit.md).
- [Referencia visual](reference.jpg).
- [Estado de ejecución y próximos pasos](progress.md).
