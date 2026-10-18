# Home V2: línea base y comparación de rendimiento

Estado: baseline de laboratorio del control registrada (20 corridas) y CrUX de producción disponible para móvil/escritorio. Home V2 todavía sin muestra de campo ni aprobación comparativa final. Ver [Goal](GOAL.md).

## Evidencia inicial del control, 17 de octubre de 2026

El build de control `873645e` terminó con código 0 en Node **24.19.0**, Next **16.4.0**, Webpack. La suite inicial pasa **124 suites, 558 tests y 15 snapshots**. El prebuild regeneró datos SEO; se conservó la salida en el workspace de auditoría y se restauró el archivo fuente, sin incorporar cambios editoriales ajenos.

Se ejecuta Lighthouse **13.5.0** sobre `http://localhost:3212/`, Chrome **155**, mediante cinco pares seriales de caché de navegador fría/caliente por dispositivo, reutilizando la misma instancia Chrome dentro de cada perfil. Se conserva el perfil Lighthouse móvil predeterminado (412×823, DPR 1,75) y escritorio predeterminado; las capturas funcionales separadas son 390×844 y 1440×900. No se ejecuta Lighthouse contra `next dev`.

Los [resultados individuales](evidence/performance/control/runs.json) se guardan conforme termina cada corrida; sus reportes JSON/HTML comprimidos están en la misma carpeta. Son datos **de laboratorio**, con throttling simulado. Se bloquea exclusivamente la recolección GA4 para no contaminar producción con el diagnóstico; GTM, anuncios y demás scripts sí se cargan. Caché «fría» significa navegador; la ruta local responde `x-nextjs-cache: HIT`, no se afirma caché fría de WordPress/CDN.

Resultados iniciales móviles, cinco corridas completas por estado: mediana de LCP frío **5.670 ms**, caliente **783 ms**; TBT frío **184,5 ms**, caliente **138,7 ms**; CLS frío **0,0732**, caliente **0,0719**. Hay dispersión: una corrida fría llega a LCP **12.241 ms**, y una caliente alcanza CLS **0,1533**. No ocultar esos valores tras la mediana; revisar anuncios y shifts en V2. La matriz termina con cinco corridas por cada combinación de dispositivo/caché. En escritorio: LCP frío **1.154 ms**, caliente **215 ms**; TBT **0 ms** en ambos estados; CLS frío **0,0703**, caliente **0,0138**. [Resumen de medianas y rangos](evidence/performance/control/summary.json). No se han implementado componentes ni modificado el control.

Auditoría de navegador (sin throttling, recorrido con scroll): **5 GraphQL POST** por dispositivo, cuatro `CoverPost` y un `VideoPosts`. En escritorio duran **936, 1.009, 725, 742 y 819 ms**; en móvil **1.006, 1.023, 743, 281 y 703 ms**, respectivamente (redondeados). Son operaciones distintas por paginación/columna, no cinco duplicados exactos; parte de las publicaciones del destacado se vuelven a obtener en columnas. El Home sirve contenido prerenderizado. Después de la matriz Lighthouse se invalidó **solo la ruta local** con su API existente y se capturó una regeneración: una consulta SSR `RecentFromCategory`, **979 ms**; primera respuesta `MISS`, siguientes dos `HIT`, sin repetir la consulta. [Registro SSR saneado](evidence/performance/control/server-wordpress.jsonl).

Se observaron **218 solicitudes** en el recorrido de escritorio y **198 en móvil** (incluyen terceros), y un error esperado de OneSignal por restringirse al dominio productivo. El JS inicial más pesado de la aplicación transfiere aproximadamente **146 KiB** en un solo chunk (488 KiB descomprimidos); AdSense añade scripts de aproximadamente **192 KiB** y **67 KiB**. Se conservará el desglose completo en el resumen final. Esto no es el coste exclusivo de hidratación.

La imagen del destacado es el elemento LCP (`picture > img.object-cover`), con carga eager/high. `CoverImage` calcula un candidato desde `srcSet` pero usa `coverImage` como URL final; esa selección no gobierna el recurso descargado. V2 debe comprobar derivados reales y bytes sin romper el fallback CDN existente.

La primera consulta pública PageSpeed de campo devolvió **429 / cuota no disponible**. Posteriormente se verificó la UI oficial de PageSpeed, que sí entrega CrUX para **esta URL** del Home actual, con datos reales agregados del **17-09 al 14-10 de 2026** (28 días), etiqueta `Many samples`, sin conteo numérico de muestra. GA4 sigue sin eventos CWV propios en el período consultado. [Informe oficial](https://pagespeed.web.dev/analysis/https-www-noticiascol-com/x8x9htvanh?form_factor=mobile), [registro de campo](evidence/performance/field/crux-control-2026-10-17.json).

| CrUX de producción, p75 | Móvil | Escritorio | Objetivo |
| --- | --- | --- | --- |
| LCP | 1,7 s | 1,7 s | ≤ 2,5 s |
| INP | 195 ms | 104 ms | ≤ 200 ms |
| CLS | 0,08 | 0,09 | ≤ 0,1 |

La evaluación oficial figura **Passed** en ambos dispositivos. Se comprobaron los rótulos `75th Percentile`, el selector `This URL`, enlace histórico con `identifier=url` y las fechas mediante el tooltip de cada dispositivo. Son valores redondeados del Home público histórico, **no de esta rama ni de Home V2**; no atribuirlos al rediseño. INP móvil y CLS escritorio quedan cerca de sus umbrales. CrUX por URL no distingue cohortes que comparten esa URL: V2 requiere medición con contexto de variante y muestra suficiente. Su campo permanece pendiente; no reemplazarlo por TBT ni por Lighthouse.

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

### Coste de comprobar oclusión propia, `b50a686`

El chunk del template pasa de **11.974 a 15.206 bytes decodificados** (+3.232); gzip nivel 9 estimado 4.710→5.896 bytes. No se añadió dependencia. Es una comparación del archivo concreto, no del grafo completo ni de transferencia HTTP. [Hash y medición](evidence/performance/analytics/occlusion-template-chunk.json).

Se comprobó además un navegador Chromium **153.0.8010.12**, sin throttling, con viewport 390×900: dos condiciones locales sobre la misma preview V2, con/sin opt-in de medición y menú real abierto. Colectores bloqueados, anuncios sin fill y banners sociales descartados en el contexto de prueba. En 2 s, con medición activa hubo 616 llamadas a `getComputedStyle` (0,9 ms acumulados) y 277 a `getBoundingClientRect` (2,8 ms); sin opt-in hubo cero. Después de cerrar el menú y dejar terminar las exposiciones, ambos casos tuvieron **cero lecturas en los siguientes 2 s**. La prueba unitaria verifica además la liberación del único temporizador compartido. [Muestra completa y límites](evidence/performance/analytics/occlusion-dom-read-cost.json).

Estos tiempos instrumentados **no son coste total de CPU**: excluyen acceso a propiedades, cálculo geométrico, dispatch de observers, GC, hidratación y scripts externos. Es una sola muestra por condición y no se compara con Lighthouse/Chrome 155. No demuestra INP ni p75 de campo, ni aprueba la regresión LCP tradicional pendiente. El build terminó correctamente; una corrida registró un HTTP 500 upstream en `RssFeed`, ajeno a los archivos modificados, por lo que no se infiere salud del feed desde ese comando.

### Coste de la integración analítica local, `f19f882`

El montaje reutiliza template/`GAPageView`/`GAEvent` y observadores nativos; no añade dependencia ni consulta editorial. Sin capacidad local y opt-in explícito, no monta los observadores Home, aunque su código se importa desde el template. Se comprobó el chunk de esa ruta: **6.044 → 11.974 bytes decodificados**, aumento **5.930 bytes**. El gzip nivel 9 del archivo nuevo se estima en 4.710 bytes, sin equipararlo a transferencia HTTP. [Tamaños, hash y límites](evidence/performance/analytics/template-chunk.json).

Esta medición de un chunk **no valida el presupuesto del grafo JavaScript inicial ni su coste de CPU**: quedan pendientes la comparación completa y los perfiles tras terminar instrumentación/arquitectura de caché. Las corridas Lighthouse anteriores pertenecen a `c096254` o commits indicados; no describen automáticamente este código. La regresión LCP tradicional y la muestra V2 de campo siguen pendientes. Las pruebas analíticas locales bloquean colectores y no generan tráfico de un experimento público.

### Punto de control tras las optimizaciones: sin aprobación final

Se ejecutaron **18 corridas Lighthouse 13.5.0 / Chrome 155 / Node 24** sobre el build `c7e55ca`: dos pares móvil frío/caliente y un par escritorio por variante, en serie, mismo root visible/page view/título/cadena GTM, colectores bloqueados y A/B apagado. Se conserva el primer arranque frío atípico. Es una comprobación intermedia; no reemplaza las cinco repeticiones por condición de la matriz final.

| Perfil | Control, LCP en segundos | V2 foto | V2 tradicional |
| --- | --- | --- | --- |
| Móvil frío, corridas 1/2 | 13,637 / 5,632 | 13,959 / 5,762 | 16,084 / 15,677 |
| Móvil caliente, corridas 1/2 | 0,787 / 0,778 | 0,820 / 0,984 | 4,248 / 3,676 |
| Escritorio frío, una corrida | 2,905 | 3,214 | 3,584 |
| Escritorio caliente, una corrida | 0,215 | 0,223 | 1,187 |

El CLS V2 observado queda alrededor de **0,0005 móvil / 0,0027 escritorio**; control tiene 0,0418 en las corridas móviles estables y 0,0142 escritorio, con un primer móvil frío de 0,1235 que se conserva. Los resultados de foto caliente son variables y **no acreditan cierre estadístico de la regresión anterior**. La tradicional conserva una regresión importante de LCP y no se aprueba. TBT y cada muestra/ajuste/elemento LCP están en el [resumen saneado](evidence/performance/checkpoint/summary.json); [hashes de reportes crudos locales](evidence/performance/checkpoint/reports-manifest.json). Ninguna cifra es INP ni p75 de usuarios reales.

En ese build, la cadena tradicional selecciona el sticky como LCP: preflight/GET de campañas activas, preflight/GET de configuración de fallback y recién después las imágenes. `fetchAllAds` esperaba la configuración de otros slots antes de devolver campañas directas ya disponibles. Una [prueba controlada anterior](evidence/performance/checkpoint/native-fallback-before.json) retiene solo esa configuración durante 3,5 s: campaña directa recibida, **cero imágenes solicitadas**; al liberarla, se solicita y muestra una.

### Campañas directas disponibles sin esperar configuración ajena

En `c096254`, `useAds` comparte dos etapas SWR: campañas activas y configuración únicamente de slots vacíos para el dispositivo. La respuesta directa está disponible inmediatamente; `pendingFallbackSlots` evita fijar prematuramente una ausencia definitiva mientras llega el fallback de ese slot. Las candidatas del popup conservan referencia si solo cambia otro slot: se mantienen el plazo de tres segundos, selección y cierre. Se conservan filtros de vigencia/dispositivo, selección aleatoria con prioridad directa, nonce diario, TTL de deduplicación y transporte publicitario existentes. No hay cambios en tablas, RLS, credenciales, IDs ni tracking.

La [misma prueba reteniendo configuración](evidence/performance/ads/native-fallback-after.json) ahora solicita **una imagen y monta una creatividad mientras la configuración sigue pendiente**, sin segunda solicitud al liberarla. Las claves `before`/`after` del JSON indican antes/después de liberar la configuración dentro del build corregido. Esto acredita la dependencia eliminada; **no son Core Web Vitals**.

Pruebas RED→GREEN cubren disponibilidad temprana, fallback tardío, errores de configuración, targeting por dispositivo, una consulta compartida por etapa, cero consultas de configuración si los ocho slots están ocupados, no-fill HTTP y popup sin reinicios, reselección ni reapertura tras su cierre. Build/lint y **144 suites, 677 tests, 15 snapshots** pasan. **36 E2E control/tradicional** en Chromium/Firefox/WebKit comprueban la pieza visible antes de liberar configuración, llegada posterior del slot de terceros, una solicitud por etapa/creatividad y una sola vista nativa, además de geometría y equivalencia del comparador. Es una corrección compartida: también se prueba el Home actual.

Documentación consultada: [peticiones condicionales y caché SWR](https://github.com/vercel/swr/blob/main/_autodocs/api-reference/use-swr.md), [Data REST API existente](https://supabase.com/docs/guides/api). La matriz comparativa final y los p75 de campo V2 permanecen pendientes; no se aprueba una regresión por resolver esta dependencia.

La regresión funcional adicional **control/fotográfica pasa 45 E2E** en los tres motores, incluida navegación por categorías/artículo y preview sin intentos de tracking. Se completaron **12 corridas focalizadas** sobre ese build: seis control y seis tradicional, mismo Node 24/Lighthouse 13.5/Chrome 155, colectores bloqueados, raíz/título/page view equivalentes. Todas cargan un GTM y un tag de destino. Son dos muestras móviles por caché y una de escritorio; no se repite Lighthouse fotográfico en este corte ni se alcanza la muestra final requerida. [Resultados y cadenas de red saneados](evidence/performance/ad-loading/summary.json), [hashes de los reportes crudos conservados localmente](evidence/performance/ad-loading/reports-manifest.json).

| Perfil | Control LCP, segundos | Tradicional LCP, segundos |
| --- | --- | --- |
| Móvil frío, corridas 1/2 | 13,406 / 5,671 | 14,728 / 15,521 |
| Móvil caliente, corridas 1/2 | 0,788 / 0,926 | 2,896 / 3,000 |
| Escritorio frío, una corrida | 2,949 | 3,422 |
| Escritorio caliente, una corrida | 0,215 | 0,846 |

**La tradicional sigue sin aprobarse:** el sticky continúa como LCP y sus valores superan los presupuestos frente al control. CLS tradicional se mantiene en 0,00057 móvil/0,00272 escritorio; TBT móvil caliente es 155/158 ms, sin inferir INP. JavaScript propio transferido en frío: 529.071 bytes control móvil y 539.281 tradicional (+1,93 %); escritorio 564.035/539.281 bytes. No son tamaños completos de dependencias ni aceptación final del bundle.

En la segunda corrida móvil fría tradicional, las consultas reales de campañas/configuración responden HTTP 200. Campañas terminan a **473 ms**; las imágenes nativas se solicitan a **488 ms**, antes de terminar configuración a **643 ms**, y terminan a 593/597 ms. La dependencia secuencial queda eliminada también en red real, sin esconder anuncios. Estas duraciones de la traza y el LCP simulado de Lighthouse son magnitudes diferentes. El resumen conserva ambas; no se interpreta que 597 ms sea el LCP simulado de 15,521 s. Comparar con `c7e55ca` tampoco aísla causalmente esta modificación: intervino además la compactación de la apertura tradicional. La causa del resto de la regresión requiere análisis posterior; no se declara resuelta.

### Anuncio fijo: controles estables cuando la creatividad está disponible

Se reprodujo el defecto del `sticky-bottom` con respuestas de imagen retenidas en el navegador, sobre control/V2 y 390/1440 px. Antes, el botón aparecía vacío al borde inferior y subía **137/140 px** al cargar la imagen; se atribuía un desplazamiento de **0,0304/0,0402** al overlay. El contador nativo ya guardaba una vista mientras la imagen seguía pendiente. La creatividad sintética tiene dimensiones deliberadamente distintas del catálogo de slots: no se supone que todas las piezas tengan la misma relación de aspecto.

El mismo `<img>` inicia su petición en el momento habitual y permanece montado. Se revela el overlay con sus controles al recibir `onLoad`, cuando dispone de su geometría natural; sin precargador adicional, dimensiones inventadas, eliminación del anuncio ni cambio de URL/ID. El observador del contador existente se conecta después de la primera carga correcta y conserva su referencia al sustituir la fuente responsive, para no contar de nuevo el mismo anuncio. Se reutiliza `useResponsiveAdImage`, eliminando dos efectos duplicados del sticky; la presentación se separa en un frame privado para cumplir la regla de complejidad del proyecto.

Después, el mismo diagnóstico registra **cero desplazamiento atribuible al sticky en los cuatro perfiles**, cero vistas antes de la imagen y una después, con **una solicitud de imagen** por creatividad. [Evidencia antes/después](evidence/performance/ads/sticky-readiness.json). Los nuevos E2E verifican dimensiones naturales, controles, descarga única, contador y cierre en los tres motores; las unitarias cubren además error de imagen y reemplazo móvil/escritorio sin segundo conteo. **143 suites/670 tests/15 snapshots, lint/build y 33 E2E pasan**.

El cambio se comparte con control y páginas internas porque corrige el componente publicitario común; sus IDs, payloads, proveedor, cierre y temporizador/umbral existentes se conservan. El temporizador real heredado es de 300 ms: estas pruebas no certifican visibilidad IAB, ingresos ni atribución publicitaria A/B. Tampoco prueban LCP resuelto ni CLS p75 real; los banners en flujo y la comparación completa de los tratamientos siguen pendientes. No comparar nuevos conteos con los históricos como si las antiguas vistas de creatividades vacías fueran exposiciones válidas.

### Optimización de imágenes verificada, comparación final pendiente

Tras corregir la equivalencia en raíz, una captura de 390×900 sin scroll encontró **17 solicitudes editoriales**, ocho correspondientes a imágenes situadas a más de 2.000 px de altura. Se reutiliza el pool `useInView` existente con margen vertical de **200 px** y `triggerOnce`: se mantiene el `picture` con su relación de aspecto, y se montan `source`/`SafeImage` al aproximarse. El fallback de capacidad carga imágenes si falta el observador; **no se aplica a la medición de impresiones**, que conserva su política estricta. La imagen crítica sigue en HTML con carga inmediata y prioridad alta.

Se agrega `ReactDOM.preload` solo a la crítica con candidatos responsive, usando exactamente su `srcSet` y `sizes`; React omite el hint automático dentro de `picture`. Sin candidatos se deja a `SafeImage` resolver su URL optimizada. El estado de error queda asociado a la fuente fallida, de forma que cambiar el municipio no pierde los candidatos de una imagen nueva. El botón móvil de calculadora se alinea en una fila conservando 44 px de altura mínima.

[Captura antes/después](evidence/performance/images/viewport-comparison.json), producción Node 24, mismo viewport y 6,5 s de observación: solicitudes editoriales **17→5 móvil** y **21→9 escritorio**, cero imágenes solicitadas a más de 2.000 px; recursos de imagen totales **23→10** y **27→15**. Una captura por perfil, sin throttling: acredita menor carga anticipada y no debe presentarse como Lighthouse, INP ni p75 real. Los datos editoriales pueden cambiar; se debe repetir la comparación completa con la arquitectura/instrumentación finales.

Verificación: **143 suites/656 tests/15 snapshots**, lint y build pasan; **21 E2E** en Chromium/Firefox/WebKit cubren el hint responsive, espacio reservado antes/después de carga, fallback de portada, filtros, videos diferidos, preview sin tracking, comparador con una sola vista y navegación control/categoría/artículo. [Documentación del observador](https://github.com/thebuilder/react-intersection-observer/blob/main/apps/docs/docs/guides/recipes.mdx), [preload responsive de React](https://react.dev/reference/react-dom/preload).

### Campos editoriales de WordPress: reducción verificada

La selección agrupada conserva diez módulos en un POST editorial más otro de taxonomías. Se solicitan extracto y bandera de destacado únicamente para apertura; URL de video únicamente para Videos. Se retiran el slug redundante del artículo y `parentId` de sus categorías: el árbol de taxonomías compartido conserva sus padres. Se versionan las claves de datos principal/regional para no retener la respuesta anterior; permanecen TTL de una hora, tags e invalidación existentes.

Dos consultas de lectura consecutivas contra WordPress, antes/después, devolvieron **los mismos IDs ordenados en los diez módulos y el mismo destacado**, comprobados con hashes, sin errores ni escrituras. La respuesta JSON editorial decodificada baja **151.070→97.371 bytes**, **53.699 bytes / 35,5 %**; extractos **97→10**, campos de destacado quedan en 10 y de video en 12. El árbol de taxonomías mantiene 4.335 bytes y las llamadas totales permanecen en dos. [Evidencia saneada](evidence/performance/data/fields-comparison.json).

Las duraciones individuales se conservan como diagnóstico; una muestra por implementación no acredita mejora de latencia, transferencia comprimida, LCP ni p75. No se amplía el TTL para esconder consultas. Deben medirse de nuevo caché y renderizado final con instrumentación montada.

La reducción pasa **143 suites/667 tests/15 snapshots, lint/build y 21 E2E** en los tres motores. Los tests verifican selección de campos por consumidor, agrupación en un POST editorial, apertura/filtro/video funcionales y continuidad de control/categoría/artículo; ninguna dependencia nueva.

### Comparación emparejada: preparación de condiciones equivalentes

No comparar directamente la preview habitual (sin GTM/banners sociales) con el baseline completo. Se extrajo el montaje existente, sin cambiar su comportamiento público, a `DeferredSiteScripts`; tests antes/después verifican scripts públicos, exclusión en demo y exclusión en QA normal. El primer comparador de las 60 corridas montaba estos scripts desde preview, pero omitía el page view existente y su tag de destino: queda registrado como diagnóstico, sin aprobación.

El comparador corregido requiere ambas banderas locales, ausencia de `VERCEL`/`VERCEL_ENV`, URL y Host de loopback, ruta raíz y selección manual `/?__ncol_home_audit=v2`. El proxy reescribe internamente a preview conservando `/` en el navegador. Control se selecciona con `/?__ncol_home_audit=control`. Se reutilizan el `Template`, `GAPageView`, título exacto, montaje y temporización de scripts existentes; no se añade otro emisor ni una excepción al transporte. No asigna variantes a visitantes ni escribe cookies del experimento. Las rutas públicas, categorías, flag apagado y revalidación mantienen su comportamiento. Preview directa continúa sin tracking.

**Usar este modo únicamente con un navegador de auditoría que bloquee envíos a GA4 y `/api/track`**. El runner conserva descarga/ejecución del GTM publicado, banners sociales y anuncios, y bloquea los colectores indicados en sus settings. La evidencia inicial de montaje [scripts-equivalence.json](evidence/performance/paired/scripts-equivalence.json) no acredita equivalencia del tag de destino; la nueva prueba `e2e/home-v2-audit.spec.ts` exige un `CUSTOM_PAGE_VIEW`, un GTM y un tag de destino por documento para cada variante, mismo título y URL raíz, sin cookie de asignación.

Arranque local de auditoría (Node 24): `VERCEL= VERCEL_ENV= HOME_V2_PREVIEW_ENABLED=true HOME_V2_PERFORMANCE_AUDIT=true npm run start -- --hostname localhost --port 3212`. Vaciar explícitamente las dos variables Vercel evita heredar los valores presentes en `.env`; sus guardas rechazaron correctamente la primera prueba de navegador. Ejecutar con `HOME_V2_AUDIT_E2E=true E2E_BASE_URL=http://localhost:3212 npx playwright test e2e/home-v2-audit.spec.ts`. El build usa las banderas apagadas por defecto.

Para probar el tratamiento tradicional sin cambiar noticias ni caché, `HOME_V2_PREVIEW_TREATMENT=traditional` elimina la imagen del destacado **solo de la copia de datos de la preview** y ejercita el selector automático real. Se etiqueta como fixture de imagen ausente, nunca como distribución de usuarios o experimento activo. Sin flag, la portada usa los datos reales y su selección automática.

Preparación validada en Node 24: **142 suites/643 tests/15 snapshots, lint/build y 18 E2E de producción en Chromium/Firefox/WebKit pasan**. Las nuevas pruebas cubren guardas de entorno y temporización Home; el helper de fixture no muta datos compartidos. Se ejecutarán matrices seriales de control actual emparejado, V2 fotográfica real y V2 tradicional con fixture, cinco repeticiones por perfil/caché. El baseline original permanece inmutable y separado. Las mediciones de campo siguen pendientes.

Completar una fila por dispositivo, tratamiento V2, perfil y estado de caché; enlazar los artefactos de cada corrida en `docs/home-v2/evidence/performance/` (o almacenamiento accesible si pesan demasiado).

| Medición                                                    | Home actual                                                  | V2 fotográfica | V2 tradicional | Diferencia / evidencia      |
| ----------------------------------------------------------- | ------------------------------------------------------------ | -------------- | -------------- | --------------------------- |
| Lighthouse móvil: score, LCP, CLS, TBT, FCP, Speed Index    | 72 frío / 98 caliente; LCP 5.670 / 783 ms; resto en resumen  | Pendiente      | Pendiente      | 5 corridas por caché        |
| Lighthouse escritorio: mismos indicadores                   | 96 frío / 100 caliente; LCP 1.154 / 215 ms; resto en resumen | Pendiente      | Pendiente      | 5 corridas por caché        |
| Elemento LCP y desglose carga/render                        | Pendiente                                                    | Pendiente      | Pendiente      | Pendiente                   |
| CWV campo: LCP p75 ≤ 2,5 s                                  | CrUX URL: 1,7 s móvil/escritorio, 17-09→14-10                  | Sin muestra    | Sin muestra    | Control cumple; V2 pendiente |
| CWV campo: INP p75 ≤ 200 ms                                 | CrUX URL: 195 ms móvil / 104 ms escritorio                    | Sin muestra    | Sin muestra    | Control cumple; V2 pendiente |
| CWV campo: CLS p75 ≤ 0,1                                    | CrUX URL: 0,08 móvil / 0,09 escritorio                        | Sin muestra    | Sin muestra    | Control cumple; V2 pendiente |
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


## Coste del adaptador local de destino

La lectura de destino se importa dinámicamente solo con permiso explícito de QA local. En el build Node 24 de esta etapa, el chunk diferido mide **11.793 bytes decodificados / 4.685 bytes gzip-9 estimados**; el template mide **16.263 / 6.248 bytes**, respectivamente. [Artefactos y hashes](evidence/analytics/reading-build.json). Son tamaños de archivos del build, no transferencias HTTP ni JS total; el reparto entre chunks puede cambiar, por lo que no se presenta su diferencia como regresión global. El adaptador no añade librerías ni consultas WordPress. El camino habitual no monta su observer ni accede a su almacenamiento.

El sondeo de lectura reutiliza el pool de visibilidad y se limita a artículos intersectando, con atribución y foco; pausa al ocultar o desenfocar. Estos controles y el code splitting reducen trabajo evitable, pero no acreditan coste total de hidratación ni INP de campo. No se repitió Lighthouse en esta etapa: sigue pendiente resolver la regresión tradicional de LCP y ejecutar la matriz final equivalente. Los datos CrUX históricos del control no se atribuyen a este adaptador ni a V2.


## Lectura de texto actualmente intersectando

Se detectó y eliminó un recorrido periódico de todos los párrafos del artículo. Un único observer nativo mantiene el conjunto de bloques intersectando; procesa el lote completo antes de decidir cada raíz. El sondeo solo comprueba geometría actual de esos bloques, con atribución, foco y las mismas reglas de oclusión. No añade dependencias ni consultas.

Prueba unitaria de 200 párrafos fuera de pantalla, seis segundos simulados: **12.200 → 0** lecturas de sus rectángulos. Un par antes/después en Chromium 153, Node 24, 390×900 y 201 párrafos de fixture en una noticia real local dio **4.378 → 22** llamadas de geometría en dos segundos; las de párrafos fuera de pantalla pasaron de **4.356 → 0**. [Datos y límites](evidence/analytics/reading-visible-text-cost.json). Los tiempos nativos parciales están cuantizados y excluyen otros costes de JS/layout/observer: no se usan para afirmar mejora de INP, hidratación o CWV. No es una comparación estadística ni la matriz Lighthouse de aceptación.


## LCP condicionado por el área editorial y el sticky

El diagnóstico actual confirma que un resultado favorable con un titular grande no cierra la regresión tradicional. En la muestra móvil con throttling DevTools, el titular real resulta LCP a 1,942 s; una fixture SSR corta, medida por separado con CDP, vuelve a seleccionar el sticky y registra **7,960 s**. La consulta de campañas empieza a los **6,055 s**. Son perfiles de laboratorio diferentes, una muestra por caso, no p75 ni una comparación estadística. [Informe reproducible, metodología y datos](evidence/performance/lcp-conditional/verification.md).

Se quitó del slot fijo del viewport la espera de idle; el popup conserva su wrapper y temporizador. La prueba reteniendo callbacks confirma disponibilidad temprana sin solicitudes duplicadas, pero la fixture SSR deja claro que la cadena de arranque/hidratación sigue pendiente. **No se aprueba el LCP tradicional con este cambio.** No se ocultan ni redimensionan anuncios para alterar el candidato, ni se retiran SDKs activos por heurística.

`__ncol_home_audit_headline=short` funciona únicamente en la auditoría local tradicional. Clona el título antes del render y conserva HTML/payload de React, ID/URI, caché, consultas y datos originales. La utilidad `scripts/home-v2/lcp-headline-probe.mjs` requiere Node 24 y Chrome, bloquea collectors, registra rol/área del candidato, comprueba creatividad cargada y errores de hidratación observados, y rechaza sobrescribir evidencia. Una exploración previa con mutaciones de DOM se descarta como comparativa por el riesgo de desalinear la hidratación.

Gates de esta etapa: 150 suites/725 tests/15 snapshots, lint, TypeScript, build y **69 E2E sin reintentos**. La comparación completa móvil/escritorio, el grafo JS/hidratación y los datos de campo V2 continúan pendientes.


## Arranque del cliente y formularios bajo demanda

El [análisis del grafo y CPU](evidence/performance/client-startup/verification.md) permite retirar de las entradas iniciales el formulario cerrado, sin eliminar su funcionalidad ni dependencias. La unión de JS compilado inicial baja 144.114 bytes en V2 (8,9 %) y 143.446 en control. Son bytes del build sin compresión, no tráfico ni hidratación medidos. Una prueba de navegador comprueba la descarga bajo demanda y conserva registro, foco, cancelación y reapertura en tres motores.

El diagnóstico pareado con titular corto continúa con LCP tardío (8,076 → 7,804 s, una muestra por configuración); no aprueba rendimiento ni permite atribuir el coste inclusivo del planificador React a Sentry. Se mantiene la comparación final y el p75 de campo pendientes. El A/B sigue apagado. El análisis opcional de Webpack y los perfiles CPU son herramientas locales manuales, sin nuevos paquetes ni medición de usuarios.


## Coste de reproducción confirmada y carrusel V2

El adaptador YouTube se importa después de activar un iframe medido; antes del clic no se carga esa API adicional, y la preview sin medición conserva iframe nativo. No se añaden consultas WordPress, dependencias ni polling del carrusel. Su controlador usa scroll nativo y lee geometría en límites de gesto; el fallback espera liberar el contacto y 250 ms sin scroll.

El grafo completo, incluyendo módulos/assets cacheados, mide **1.512.371 bytes iniciales compilados en control / 1.477.871 en V2**, con 28/25 assets respectivamente. Frente a `35838c1`, +1.363/+4.978 bytes (+0,34 % V2). El chunk propio de API YouTube es diferido y mide **1.361 bytes**. La prueba con YouTube real observó **28.031 bytes decodificados** entre los dos scripts de API tras activación; excluye player, medios y otros recursos. No son tráfico comprimido ni coste total del embed. [Método, datos y límites](evidence/analytics/video/verification.md).

Se corrigió una limitación del inventario anterior: un build caliente con stats parciales omitía módulos cacheados. La tabla histórica de assets y las pruebas de descarga diferida conservan validez, pero el inventario vacío por sí solo no demostraba ausencia de librerías. El grafo actual confirma que formularios/Zod/resolvers continúan activos en chunks diferidos; no deben retirarse como código muerto.

No se repitió la matriz Lighthouse como sustituto de resolver la cadena de arranque pendiente. El LCP tradicional corto, la hidratación/INP completos, la comparación final y los p75 de campo V2 siguen sin aprobarse. La reproducción confirmada local no activa A/B ni configura un sistema analítico nuevo.


## Adaptador común del control y carga de visibilidad

El control QA reutiliza el adaptador YouTube y el carrusel nativo, conserva el paso de 80 % y evita reinstalar listeners por referencias nuevas del array de posts. No añade consultas de WordPress; los recorridos de fixture comprueban un feed de video y un feed de autores durante sus interacciones. La API confirma play, sin autoplay añadido al control ni cambio del `src`. El helper de visibilidad se importa diferido para ese modo; V2 sigue iniciando la API tras activar el video.

Grafo cacheado completo y tamaños físicos: control **1.518.357 bytes/28 assets JS**; V2 **1.479.082/25**, frente a `92f6ae5` +5.986/+1.211 bytes. El import diferido evita 4.611/4.307 bytes iniciales frente a la versión intermedia de esta etapa; la utilidad también tiene consumidores en el template y no se declara ausente del grafo inicial. El SDK propio YouTube sigue diferido en 1.361 bytes. La comprobación con proveedor real observa 28.031 bytes decodificados de scripts API, excluyendo player/UI/medios y compresión. [Método y límites](evidence/analytics/control-specialized.md).

No se atribuyen estos bytes a mejoras de LCP/INP ni se cierra la comparación. El LCP tradicional corto, la matriz final equivalente, la política de consentimiento/activación tardía, RUM y los p75 V2 de campo siguen pendientes. Los fallos iniciales de encuadre de tests y el selector CSS antiguo del player se conservan como diagnósticos, separados de las corridas aprobadas.


## Coste incremental y cobertura de Web Vitals locales

El build QA incorpora el hook nativo de Next.js instalado, con una sola referencia estable en el layout. No añade dependencia de npm ni medición propia mediante PerformanceObserver. Frente al checkpoint `465c89b`, la unión inicial `main-app` + layout + template + página pasa de 28 JS / 1.518.357 bytes a 29 / 1.525.138 en control, y de 25 / 1.479.082 a 26 / 1.485.863 en V2: **+6.781 bytes minificados** en ambos (+0,45 % / +0,46 %). Inventario cache-aware y tamaños físicos comprobados. Son bytes de build QA, no transferencia comprimida, CPU ni una mejora CWV.

Ocho recorridos nativos Chromium a 390/1440 px, incluidos ambos tratamientos V2, verifican LCP/INP/CLS en el dataLayer de control y V2, manteniendo el origen Home tras visitar una noticia. Catálogo de anuncios vacío y collectors bloqueados: los números son diagnósticos locales de atribución, sin validez como comparación Lighthouse o p75 de campo. El callback de INP no se inventa cuando falta soporte/interacción. [Evidencia](evidence/analytics/vitals/verification.md).

El A/B sigue apagado. Continúan pendientes consentimiento/cohortes y mapping remoto, muestra V2 de campo, matriz final equivalente y resolver o justificar la regresión LCP tradicional de titular corto. La recuperación histórica de CrUX del control conserva su ventana y alcance originales.


## Preparación de configuración GTM, sin coste runtime nuevo

El mapping local se genera desde el export v32 y conserva los tags existentes; las cuatro incorporaciones están pausadas y no se importó/publicó nada. El script offline no añade bytes al bundle de aplicación, llamadas WordPress, imágenes ni collectors. Pasan siete pruebas de configuración, la suite de aplicación y lint. No se utiliza este cambio documental/configuración para afirmar una mejora de Lighthouse/CWV ni una medición real. [Paquete](evidence/analytics/gtm/verification.md). La recepción de valores finales CWV, los joins por exposición y el acceso a eventos sin agregación siguen pendientes.

## Opinión: identidad de artículo y consultas independientes

La consulta existente incorpora el `id` público de WordPress en la misma respuesta. Ambos widgets usan ese ID para impresiones/clics y conservan la URI para navegar y como respaldo compatible con respuestas anteriores. Los enlaces al autor siguen fuera de la medición de noticias. No se añade transporte ni consulta por tarjeta.

La acción selecciona primero los autores únicos en orden editorial y solicita sus retratos en paralelo, conservando límite, fallback de avatar y `no-store`. Una prueba con dos respuestas retenidas verifica que ambas arrancan antes de resolver ninguna y que el orden de llegada no cambia el resultado. El diagnóstico real actual contiene un único autor: confirma compatibilidad y número de peticiones, pero **no demuestra una mejora de latencia por paralelización**. [Evidencia y límites](evidence/analytics/opinion-data/verification.md).

## Diagnóstico actual y corrección de imagen crítica

La comparación de 40 corridas del código `d991b50` identifica una regresión móvil fría de foto: LCP mediano **8,076 s frente a 5,509 s** del control; CLS mejora, pero no compensa LCP. El navegador descarga el JPEG original de 571 KB en V2. [Matriz, recursos y límites](evidence/performance/responsive-original/verification.md).

La corrección usa el optimizador Next existente únicamente para la imagen crítica V2, conserva el default heredado de `SafeImage`, calcula `sizes` desde el grid y elimina el 308 intermedio del endpoint de imagen. En 412/DPR 1,75, la misma fuente responde WebP de 28.572 bytes; 21 escenarios reales de recurso verifican descarga única y ancho correcto. Pasan 775 pruebas/15 snapshots y 57 E2E/tres omisiones, lint/tipos/build. La [comparación posterior de 80 corridas](evidence/performance/optimized-0d79c93/verification.md) ya está disponible; foto cumple los presupuestos locales y tradicional conserva regresiones señaladas. Los bytes por sí solos no aprueban campo. [Contrato y evidencia](evidence/performance/critical-image/verification.md).

## Comparación de 80 corridas sobre `0d79c93`

La corrección fotográfica evita las regresiones medianas de los presupuestos locales: LCP frío **4,370 s móvil frente a 5,502 s control**, y **0,857 s escritorio frente a 1,121 s**. Caliente: 0,999/0,803 s móvil y 0,264/0,215 s escritorio. CLS mejora; TBT no se reporta como INP. JS, documentos e imágenes tienen mejoras y aumentos registrados por separado. [Tabla completa, rangos y metodología](evidence/performance/optimized-0d79c93/verification.md).

**Tradicional sigue pendiente:** escritorio LCP 3,298/0,975 s frío/caliente; con titular corto, móvil 15,177/3,708 s y escritorio 3,252/0,864 s. Seis celdas LCP superan presupuesto. El sticky es el candidato; tres probes nativos con la misma creatividad confirman que el recurso también llega tarde en control, mientras la portada editorial aparece antes. Esa causa documentada no se convierte en aprobación global. Las integraciones y la monetización se preservan; hace falta cerrar el tratamiento tradicional. No hay campo V2 ni activación del A/B.

## Integridad de caché editorial probada en producción local

El [ensayo aislado de caché](evidence/performance/cache-integrity/verification.md) usa Next real y los getters/handler existentes: un miss sano obtiene taxonomías y todos los módulos en dos POST; los hits no repiten consultas y dos consumidores comparten el mismo resultado. Las invalidaciones de categoría/portada actualizan los snapshots previstos. Se corrigió la persistencia de errores GraphQL parciales, conservando datos útiles y el contrato del control. Pasan 778 pruebas/15 snapshots, lint, tipos, build y 69 E2E. Esto cubre recuperación e invalidación local; publicación real, CDN y rendimiento bajo carga siguen pendientes. No genera valores nuevos de Lighthouse/CWV ni cierra las regresiones tradicionales de la matriz anterior.

## Identidad del ranking sin peticiones adicionales

Se preparan las claves largas con Web Crypto en los fetchers existentes; las ventanas conservan URL, caché, paralelismo y una solicitud cada una. La consulta de artículo añade `id` sin otra operación. La extracción del validador público evita arrastrar el módulo de sesión: −3.985 bytes compilados en ambas uniones iniciales respecto de esa implementación intermedia. El delta final desde `0d79c93`, incluida la corrección compartida de caché anterior, es +1.662 bytes de control y +1.255 de V2, con 29/26 assets JS. [Inventario físico y límites](evidence/analytics/ranking-identity/bundles.json), [64 E2E y contrato](evidence/analytics/ranking-identity/verification.md). No son transferencia HTTP, hidratación, Lighthouse ni datos de campo nuevos; la matriz tradicional conserva su estado separado.

## Tamaños editoriales y descubrimiento inicial de la imagen regional

La [comparación fotográfica de 40 corridas](evidence/performance/editorial-sizes/verification.md) conserva los presupuestos medianos de LCP/TBT/CLS, con el aumento de bytes de GIF publicitarios calientes explicado por campaña/caché. Se corrigen `sizes` para las columnas reales, sin cambiar CSS, consultas, hero ni analítica. Un diagnóstico tradicional detectó la imagen regional inicialmente visible descubierta tras hidratación; se incluye ahora en el HTML con carga nativa diferida y sin preload adicional. Su comparación posterior queda pendiente hasta finalizar las nuevas corridas; no se extrapola la mejora fotográfica a tradicional.

## Coste de corregir atribución temprana

La captura de origen se monta antes de que el usuario pueda navegar; solo el scanner DOM de destino sigue diferido. Esto añade 8294 bytes compilados al inventario inicial de cada ruta, sin duplicar el coordinador ni añadir dependencias. La corrección de tarjetas sin imagen solo hace que su texto ocupe todas las columnas. [Inventario, regresiones y límites](evidence/review/whole-branch.md). La comparación temporal del código corregido sigue pendiente y no se sustituye por ese tamaño compilado.
