# Home V2: línea base y comparación de rendimiento

Estado: baseline de laboratorio del control registrada (20 corridas), con build de producción anterior a los cambios de aplicación. Datos de campo y comparación V2 pendientes. Ver [Goal](GOAL.md).

## Evidencia inicial del control, 17 de octubre de 2026

El build de control `873645e` terminó con código 0 en Node **24.19.0**, Next **16.4.0**, Webpack. La suite inicial pasa **124 suites, 558 tests y 15 snapshots**. El prebuild regeneró datos SEO; se conservó la salida en el workspace de auditoría y se restauró el archivo fuente, sin incorporar cambios editoriales ajenos.

Se ejecuta Lighthouse **13.5.0** sobre `http://localhost:3212/`, Chrome **155**, mediante cinco pares seriales de caché de navegador fría/caliente por dispositivo, reutilizando la misma instancia Chrome dentro de cada perfil. Se conserva el perfil Lighthouse móvil predeterminado (412×823, DPR 1,75) y escritorio predeterminado; las capturas funcionales separadas son 390×844 y 1440×900. No se ejecuta Lighthouse contra `next dev`.

Los [resultados individuales](evidence/performance/control/runs.json) se guardan conforme termina cada corrida; sus reportes JSON/HTML comprimidos están en la misma carpeta. Son datos **de laboratorio**, con throttling simulado. Se bloquea exclusivamente la recolección GA4 para no contaminar producción con el diagnóstico; GTM, anuncios y demás scripts sí se cargan. Caché «fría» significa navegador; la ruta local responde `x-nextjs-cache: HIT`, no se afirma caché fría de WordPress/CDN.

Resultados iniciales móviles, cinco corridas completas por estado: mediana de LCP frío **5.670 ms**, caliente **783 ms**; TBT frío **184,5 ms**, caliente **138,7 ms**; CLS frío **0,0732**, caliente **0,0719**. Hay dispersión: una corrida fría llega a LCP **12.241 ms**, y una caliente alcanza CLS **0,1533**. No ocultar esos valores tras la mediana; revisar anuncios y shifts en V2. La matriz termina con cinco corridas por cada combinación de dispositivo/caché. En escritorio: LCP frío **1.154 ms**, caliente **215 ms**; TBT **0 ms** en ambos estados; CLS frío **0,0703**, caliente **0,0138**. [Resumen de medianas y rangos](evidence/performance/control/summary.json). No se han implementado componentes ni modificado el control.

Auditoría de navegador (sin throttling, recorrido con scroll): **5 GraphQL POST** por dispositivo, cuatro `CoverPost` y un `VideoPosts`. En escritorio duran **936, 1.009, 725, 742 y 819 ms**; en móvil **1.006, 1.023, 743, 281 y 703 ms**, respectivamente (redondeados). Son operaciones distintas por paginación/columna, no cinco duplicados exactos; parte de las publicaciones del destacado se vuelven a obtener en columnas. El Home sirve contenido prerenderizado. Después de la matriz Lighthouse se invalidó **solo la ruta local** con su API existente y se capturó una regeneración: una consulta SSR `RecentFromCategory`, **979 ms**; primera respuesta `MISS`, siguientes dos `HIT`, sin repetir la consulta. [Registro SSR saneado](evidence/performance/control/server-wordpress.jsonl).

Se observaron **218 solicitudes** en el recorrido de escritorio y **198 en móvil** (incluyen terceros), y un error esperado de OneSignal por restringirse al dominio productivo. El JS inicial más pesado de la aplicación transfiere aproximadamente **146 KiB** en un solo chunk (488 KiB descomprimidos); AdSense añade scripts de aproximadamente **192 KiB** y **67 KiB**. Se conservará el desglose completo en el resumen final. Esto no es el coste exclusivo de hidratación.

La imagen del destacado es el elemento LCP (`picture > img.object-cover`), con carga eager/high. `CoverImage` calcula un candidato desde `srcSet` pero usa `coverImage` como URL final; esa selección no gobierna el recurso descargado. V2 debe comprobar derivados reales y bytes sin romper el fallback CDN existente.

La consulta pública PageSpeed de campo devolvió **429 / cuota no disponible**. GA4 no registra eventos CWV en el período consultado. **Campo permanece pendiente**; no reemplazarlo por TBT ni por los resultados Lighthouse anteriores.

## Punto de comparación

Control: `origin/main`, commit `873645e117a061db8fbe500493eaf6742b5d8c7a`. El manifiesto declara Next.js `^16.4.0`, React `^19.3.0`, Node 24 y `next build --webpack`; registrar versiones efectivas del lockfile/runtime al medir. No actualizar dependencias como parte de la línea base.

Observaciones verificadas:

- `src/app/page.tsx`: página de servidor con `revalidate = 7200`; destacado de servidor, columnas cliente y módulos diferidos.
- `getFeaturedPost`: consulta publicaciones de `_Pos_Columna_izq`, caché de una hora con tags `homepage` y `featured-post`. La caché de datos y la de ruta tienen alcances diferentes; medir frescura efectiva.
- `fetchAPI`/`cachedFetchAPI`: GraphQL POST mediante `HttpClient`, `unstable_cache` explícita. No asumir memoización automática de POST al dividir en módulos.
- `useFetchAPI` + SWR: consultas cliente por clave query/variables; desactiva revalidación al foco/reconexión. Contar también estas solicitudes, no solo SSR.
- `SafeImage`: usa `next/image`, pero omite optimizador para `cdn.noticiascol.com` por compatibilidad con imágenes heredadas. Elegir derivados WordPress adecuados y verificar bytes reales; `sizes` no reduce por sí mismo una URL `unoptimized`.
- `next.config.mjs`: WebP, tamaños de dispositivos e imágenes configurados. Reutilizar este sistema y no modificar la estrategia CDN global sin prueba separada.
- `VideoCarousel`: scroll nativo, sin librería de carrusel; carga con margen de 200 px. Medir costo de embeds y JavaScript antes de reemplazarlo.
- GTM se difiere por idle/interacción/timeout; comparar también después de scroll, clic y espera. Un score inicial sin cargar terceros no representa toda la experiencia.

## Protocolo reproducible

1. Guardar commit, fecha UTC, URL/entorno, versiones Node/Next/Chrome/Lighthouse, perfil de CPU/red, viewport, DPR, estado de consentimiento, anuncios, scripts, estado de caché y snapshot de contenido. Usar build de producción, no `next dev`.
2. Comparar control y V2 sobre las mismas noticias, imágenes, región, slots y condiciones; después verificar con contenido vivo. Móvil 390×844 y escritorio 1440×900; conservar perfiles Lighthouse móvil/escritorio predeterminados y registrar cualquier cambio.
3. Ejecutar al menos 5 corridas por variante/dispositivo y por caché de navegador fría/caliente. Separar caché de origen/CDN HIT/MISS, comprobando headers disponibles; no purgar producción para medir. Guardar resultados individuales, mediana y dispersión, sin elegir solo el mejor.
4. Guardar JSON/HTML Lighthouse, HAR saneado y trazas de Performance con carga e interacciones (filtro, carrusel, servicios, clic de artículo). Registrar elemento LCP, bytes, decode, fuentes, long tasks y coste de hidratación mediante scripting/main thread y trazas; no llamar a todo scripting «hidratación».
5. Contar consultas WordPress **en servidor y navegador**: firma de operación + variables normalizadas, cantidad, duración individual y acumulada, payload, errores/reintentos, cache HIT/MISS y solicitudes repetidas. Instrumentar temporalmente los clientes en entorno de QA sin payloads sensibles; un HAR no ve consultas SSR.
6. Capturar carga inicial y recorrido hasta el footer; separar inicial, módulos bajo demanda, prefetch y terceros. Evaluar anuncios servidos/no-fill/error, expansión, sidebar sticky, fuentes, imágenes fallidas y carrusel. No usar modo demo como sustituto de anuncios reales.
7. Medir JS/CSS transferido y descomprimido por ruta, chunks compartidos y diferidos, cobertura y parse/ejecución. El build Next 16 no reporta `First Load JS` como evidencia suficiente. El bundler de este repositorio es Webpack; si hace falta treemap, usar analizador compatible tras revisar documentación, sin cambiar el bundler para comparar.
8. Exportar datos de campo disponibles (CrUX, Search Console o medición existente): fuente, ventana, URL/origin, dispositivo, muestra y p75. CrUX agregado por URL/origin no distingue variantes A/B; para esa comparación hace falta contexto de variante en el transporte existente.

La versión de Lighthouse usada es 13.5.0, instalada en el caché de `npm exec`, sin cambiar dependencias del proyecto. Runner serial equivalente para la futura comparación (usar otra carpeta de salida, nunca sobreescribir control):

```bash
npm exec --yes --package=lighthouse@13.5.0 -- node scripts/home-v2/lighthouse.mjs http://localhost:3212/ docs/home-v2/evidence/performance/v2
```

El runner conserva JSON/HTML y trazas comprimidos cuando la API los expone; `runs.json` guarda métricas y red sin querystrings. Los reportes completos del control se conservan localmente (22 MiB); [manifest de hashes](evidence/performance/control/reports-manifest.json). Por contener URLs/identificadores técnicos de terceros y ser voluminosos, no se agregan en bloque a Git: publicar artefactos de QA saneados al preparar el PR final. Los resúmenes y capturas de red saneadas sí forman parte de la evidencia revisable. El runner extraído debe ejercitarse en la comparación V2; las corridas de control se realizaron con la misma lógica desde el workspace de auditoría.

## Diagnóstico previo a optimizaciones: 60 corridas

Build de aplicación `0e923d8`, Node 24.19.0, Lighthouse 13.5.0; cinco repeticiones por dispositivo/caché en cada variante, ejecutadas en serie. [Control emparejado](evidence/performance/paired/control-summary.json), [V2 con foto](evidence/performance/paired/photographic-summary.json), [tradicional sin imagen, fixture](evidence/performance/paired/traditional-summary.json), [presupuestos y diferencias](evidence/performance/paired/comparison-preoptimization.json). El script `scripts/home-v2/summarize.mjs` exige una matriz completa de 20 informes y conserva medianas/rangos, configuración, recursos, elementos LCP y causas de CLS.

**Estos resultados son diagnóstico, no aprobación ni datos de campo.** La inspección posterior detectó que montar el mismo contenedor no garantiza disparar todos sus tags: en la preview no aparece `gtag/destination`, mientras sí aparece en control, coincidiendo con la exclusión de `CUSTOM_PAGE_VIEW`. La comparación final debe servir ambas presentaciones desde la misma ruta local, conservar la única vista del sistema actual y bloquear colectores en el navegador. No se añadirá un emisor paralelo para compensarlo. También se repetirá con la instrumentación y arquitectura final, manteniendo A/B público apagado.

Medianas de **LCP simulado de laboratorio, segundos**:

| Perfil | Control | V2 foto | V2 tradicional sin imagen |
| --- | ---: | ---: | ---: |
| Móvil, frío | 5,641 | 5,930 | 15,818 |
| Móvil, caliente | 0,782 | 1,004 | 3,679 |
| Escritorio, frío | 1,152 | 1,235 | 3,355 |
| Escritorio, caliente | 0,215 | 0,267 | 1,056 |

Mejoras observadas, sujetas a la repetición final equivalente:

- CLS móvil: control **0,073 frío / 0,082 caliente**, foto **0,032 / 0,032** y tradicional **0,032 / 0,032**. CLS escritorio frío: **0,070 → 0,058**. El sticky inferior sin dimensiones explícitas sigue apareciendo entre las causas de CLS; no se declara resuelto.
- TBT móvil frío: **198 → 155,5 ms** con foto; caliente **138,7 → 94 ms**. Tradicional: **186 / 68 ms**. Escritorio: mediana **0 ms** en los tres casos. TBT no equivale a INP.
- JS de primera parte transferido en frío: móvil **528.815 → 539.892 bytes** (+11.077; dentro del presupuesto); escritorio **563.779 → 539.892 bytes** (−23.887). Los scripts de terceros fluctúan y no se atribuye toda su diferencia al frontend.

Regresiones pendientes, sin aprobación implícita por mejorar el score:

| Caso | Regresión de LCP frente al control | Evidencia y siguiente acción |
| --- | ---: | --- |
| Foto, móvil caliente | +223 ms / +28,5% | Cruza ambos límites del presupuesto. Documento **45,9 KB transferidos / 244 KB decodificados**, frente a **28,3 / 151 KB** del control. Revisar serialización, campos no usados y carga adelantada de imágenes. El TTFB observado de la traza es de pocos milisegundos; no culpar únicamente al render dinámico. |
| Tradicional, móvil frío/caliente | +10.177 / +2.898 ms | El elemento LCP es la imagen de `sticky-bottom`, no un titular editorial. Su URL se descubre después de la cadena cliente de anuncios. Optimizar esa cadena sin eliminar el anuncio ni cambiar sus IDs. |
| Tradicional, escritorio frío/caliente | +2.203 / +840 ms | Mismo elemento LCP publicitario. Confirmar transferencia, dependencia cliente y dimensiones antes de modificar su carga. |

La primera corrida fría de foto en escritorio dio 2,929 s, pero la mediana de sus cinco corridas es **1,235 s**, dentro del presupuesto frente a 1,152 s. Los rangos completos se conservan; no se oculta el outlier ni se usa como mediana. El CLS caliente del control pasó del 0,014 mediano original a 0,069 en esta matriz; el mismo anuncio sin tamaño ya aparece en informes originales con 0,069. Su variación requiere estabilización y nueva comprobación, no atribución automática al rediseño.

Recursos observados durante las auditorías, no necesariamente solo antes del primer paint: imágenes móvil **9 control / 23 foto / 22 tradicional**; escritorio **12 / 27 / 26**. Separar contenido adicional de solicitudes adelantadas fuera de pantalla mediante captura de viewport antes de decidir el cambio. La imagen LCP fotográfica está en HTML, eager y high; falta comprobar una precarga responsive que coincida con el `<picture>`, sin descargar dos derivados.

### WordPress y revalidación local

[Prueba autenticada de caché](evidence/performance/paired/cache-wordpress.json), ejecutada después de las matrices; el secreto no se guarda. Se invalidó `/` mediante el endpoint existente y sus tags existentes:

- V2 en frío: **dos POST**, `HomeEditorialTaxonomies` (543 ms) y `HomeEditorialModules` (2.671 ms); respuesta completa local **3.627 ms**. El segundo reúne los diez módulos. Las taxonomías preceden a la consulta porque sus IDs/descendientes se necesitan para componerla.
- Segunda carga V2: **cero POST a WordPress**, respuesta local **22 ms**; la ruta es dinámica y la caché es de datos. No etiquetar este tiempo como LCP.
- Control tras invalidación: **un POST SSR**, `RecentFromCategory` (609 ms), respuesta local **785 ms**, `MISS`; segunda carga **7 ms**, `HIT`, sin POST SSR.
- En navegador, las matrices registran **cero POST directos a WordPress en V2**, frente a medianas 4 en frío / 2 en caliente del control. Los widgets especializados conservan sus fuentes y su coste se registra aparte. No sumar una consulta SSR con la misma petición observada en el navegador ni inferir cantidad de SQL desde conexiones GraphQL.

La reconstrucción fría V2 merece optimización/precalentamiento de la arquitectura final; los TTL no se amplían para esconderla. La prueba acredita invalidación y reutilización, no publicación real de una noticia ni cambio en WordPress productivo.

Se conservan localmente **180 artefactos comprimidos** (JSON/HTML/traza de 60 corridas, unos 279 MiB) y sus [hashes](evidence/performance/paired/reports-manifest.json). No se agregan los archivos crudos a Git; los resúmenes revisables omiten cookies, cuerpos de petición y snippets de contenido. [Fixture tradicional móvil](evidence/ui/traditional-mobile-initial.png) es una captura inicial, todavía con imágenes/widget en carga; no sustituye la validación visual final.

## Registro final obligatorio de resultados

### Comparación emparejada: preparación de condiciones equivalentes

No comparar directamente la preview habitual (sin GTM/banners sociales) con el baseline completo. Se extrajo el montaje existente, sin cambiar su comportamiento público, a `DeferredSiteScripts`; tests antes/después verifican scripts públicos, exclusión en demo y exclusión en QA normal. En la preview local se puede habilitar exclusivamente la auditoría con `HOME_V2_PREVIEW_ENABLED=true HOME_V2_PERFORMANCE_AUDIT=true`; `homeTiming` usa los mismos tiempos del Home en `DeferredGoogleTagManager`. No añade contenedor ni cambia IDs. Este modo no habilita A/B.

**Usar este modo únicamente con un navegador de auditoría que bloquee envíos a GA4 y `/api/track`**. El runner conserva descarga/ejecución del GTM publicado, banners sociales y anuncios, y bloquea solo los colectores indicados en sus settings. El dataLayer de QA continúa excluyendo eventos propios; una diferencia de mensajes GA4 bloqueados no debe confundirse con un cambio de integración. La inspección de red confirma HTTP 200, **un mismo montaje GTM y un banner social** en cada ruta; todos los intentos observados de colector quedan interceptados. [Evidencia de condiciones](evidence/performance/paired/scripts-equivalence.json).

Para probar el tratamiento tradicional sin cambiar noticias ni caché, `HOME_V2_PREVIEW_TREATMENT=traditional` elimina la imagen del destacado **solo de la copia de datos de la preview** y ejercita el selector automático real. Se etiqueta como fixture de imagen ausente, nunca como distribución de usuarios o experimento activo. Sin flag, la portada usa los datos reales y su selección automática.

Preparación validada en Node 24: **142 suites/643 tests/15 snapshots, lint/build y 18 E2E de producción en Chromium/Firefox/WebKit pasan**. Las nuevas pruebas cubren guardas de entorno y temporización Home; el helper de fixture no muta datos compartidos. Se ejecutarán matrices seriales de control actual emparejado, V2 fotográfica real y V2 tradicional con fixture, cinco repeticiones por perfil/caché. El baseline original permanece inmutable y separado. Las mediciones de campo siguen pendientes.

Completar una fila por dispositivo, tratamiento V2, perfil y estado de caché; enlazar los artefactos de cada corrida en `docs/home-v2/evidence/performance/` (o almacenamiento accesible si pesan demasiado).

| Medición                                                    | Home actual                                                  | V2 fotográfica | V2 tradicional | Diferencia / evidencia      |
| ----------------------------------------------------------- | ------------------------------------------------------------ | -------------- | -------------- | --------------------------- |
| Lighthouse móvil: score, LCP, CLS, TBT, FCP, Speed Index    | 72 frío / 98 caliente; LCP 5.670 / 783 ms; resto en resumen  | Pendiente      | Pendiente      | 5 corridas por caché        |
| Lighthouse escritorio: mismos indicadores                   | 96 frío / 100 caliente; LCP 1.154 / 215 ms; resto en resumen | Pendiente      | Pendiente      | 5 corridas por caché        |
| Elemento LCP y desglose carga/render                        | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |
| CWV campo: LCP p75 ≤ 2,5 s                                  | Sin datos consultados                                        | Sin muestra    | Sin muestra    | Pendiente                   |
| CWV campo: INP p75 ≤ 200 ms                                 | Sin datos consultados                                        | Sin muestra    | Sin muestra    | Pendiente                   |
| CWV campo: CLS p75 ≤ 0,1                                    | Sin datos consultados                                        | Sin muestra    | Sin muestra    | Pendiente                   |
| Interacciones de laboratorio / long tasks / TBT             | Pendiente                                                    | Pendiente      | Pendiente      | No equivalen a INP de campo |
| JS y CSS inicial/diferido: transferencia, parse y ejecución | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |
| Solicitudes HTTP iniciales y recorrido completo             | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |
| WordPress: número, duplicadas, duración, payload            | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |
| Imágenes: URL, derivado, dimensiones, bytes, LCP/lazy       | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |
| Hidratación: componentes cliente y traza main thread        | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |
| Caché, revalidación, publicación/edición y frescura         | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |
| Publicidad/terceros: solicitudes, layout shifts y sticky    | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |

Lighthouse/TBT no son INP real. Pruebas de interacción en laboratorio no son p75 de usuarios. La ausencia de datos no es cero. Para aceptar campo, registrar antes del A/B la ventana y muestra mínima acordadas; hasta entonces el criterio de campo permanece pendiente.

## Presupuestos de regresión del proyecto

Estos son umbrales de revisión del proyecto, no estándares de CWV. Fijarlos antes de la implementación y comparar medianas de corridas equivalentes:

- LCP de laboratorio: revisar regresión cuando exceda **a la vez 10% y 200 ms** frente al control.
- TBT o latencia de interacciones de laboratorio: revisar si excede **a la vez 10% y 50 ms**. No etiquetar estos valores como INP de campo.
- CLS: revisar incremento absoluto mayor de **0,02**, cualquier nuevo desplazamiento por imagen/anuncio sin dimensiones, o cruce del umbral **0,1**.
- JS inicial comprimido: revisar aumento de **más de 10% o 20 KiB**. Identificar import y componente responsables.
- Datos: **cero consultas WordPress idénticas redundantes** por render; una carga de taxonomías compartida; hidratar datos precargados sin repetirlos inmediatamente. Nuevas consultas únicas para contenido nuevo se justifican por módulo y se comparan en número, bytes y duración.
- HTTP/imágenes: revisar aumento mayor al 10% para el mismo conjunto de contenido; justificar solicitudes de contenido adicional por separado. No cargar imágenes/iframes de todas las tarjetas del carrusel de forma anticipada.
- Frescura: conservar como máximo los TTL actuales por fuente salvo justificación editorial explícita; probar publicación, corrección y revalidación por tags en ambas variantes.

Registrar mejoras y regresiones en tablas separadas, con causa, fix o justificación explícita, responsable, evidencia y decisión. Ninguna regresión significativa queda aprobada por omisión o por mejorar el score global.

## Acciones técnicas y pruebas de cierre

- Composición editorial de servidor, con islas cliente para filtro, enlaces instrumentados, observers y video. Una frontera cliente no debe arrastrar toda la portada al bundle.
- Carga coordinada con clientes modulares de `src/lib/api`, paralelizando consultas independientes y compartiendo resultados/descendientes. Medir ahorro; no extender TTL para esconder consultas.
- Tamaños responsivos por presentación, derivados WordPress y reservas de aspect ratio. Priorizar solo imagen crítica visible y verificar preload/fetchPriority con la versión instalada; lazy para resto.
- CSS, fuentes y dependencias: usar lo existente y eliminar solo lo auditado. Reservar tamaños de slots, controlar no-fill y revisar sticky sin cambiar IDs ni integraciones.
- Pruebas de `getHomeV2Data`: conteo de llamadas por operación, taxonomías compartidas, filtros repetidos cacheados, fallos parciales sin waterfalls ni duplicados.
- Comparación final con mismos perfiles; adjuntar informes, análisis de bundles/WordPress/imágenes y datos de campo disponibles. El Goal sigue activo si falta evidencia obligatoria.

## Referencias técnicas consultadas

Documentación actual obtenida con Context7 y contrastada con `node_modules/next/dist/docs/`: [datos en App Router](https://nextjs.org/docs/app/getting-started/fetching-data), [bundles](https://nextjs.org/docs/app/guides/package-bundling), [Image](https://nextjs.org/docs/app/api-reference/components/image), [Web Vitals](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals). La versión instalada prevalece sobre ejemplos de ramas canary.

## Artefactos adicionales del control

- [HAR escritorio saneado](evidence/performance/control/desktop-sanitized.har) y [HAR móvil saneado](evidence/performance/control/mobile-sanitized.har): sin cookies, headers de petición, parámetros de URL ni cuerpos de petición/respuesta. Corresponden a una captura técnica posterior a la matriz; la cantidad de anuncios puede variar.
- [Recursos por dispositivo](evidence/performance/control/resources-summary.json): mediana JS total frío 1.535.715 bytes móvil / 1.700.252 escritorio; de primera parte, 527.576 / 562.529 bytes. Incluyen scripts diferidos del período de observación, no solo el recurso crítico.
- [Navegador escritorio](evidence/performance/control/desktop-browser.json) y [móvil](evidence/performance/control/mobile-browser.json): timings WordPress, recursos, consentimiento observado y métricas CDP. No se etiquetan todas las tareas de scripting como hidratación.
- Trazas Playwright completas de ambos dispositivos y primera traza Lighthouse móvil conservadas en el workspace de auditoría; requieren saneamiento antes de publicarse. No están agregadas a Git.
