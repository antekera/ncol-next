# Estado de ejecución de Home V2

## Comparación actual: foto cumple presupuesto local; tradicional abierto

Se completaron 80 corridas Lighthouse y tres probes nativos sobre `0d79c93`. Foto mejora LCP frío 20,6 % móvil y 23,5 % escritorio frente al control actual, con presupuestos medianos de LCP/TBT/CLS/JS cumplidos. Tradicional conserva seis celdas LCP fuera de presupuesto, con el sticky como candidato; misma creatividad/tamaño y disponibilidad tardía también observada en control. El diagnóstico no aprueba esa regresión ni los p75 de campo. [Resultados y límites](evidence/performance/optimized-0d79c93/verification.md).

El Goal continúa activo; A/B público apagado. Siguen pendientes cierre tradicional, caché/revalidación integrada, consentimiento/cohortes, GTM Preview/GA4, Dailymotion y revisión/PR.

## Imagen crítica corregida; aprobación de rendimiento pendiente

La matriz actual localiza la regresión móvil en un original JPEG pesado. Se prepara el opt-in compatible del optimizador Next para el hero V2, `sizes` exactos y paso directo del endpoint de imagen; el control conserva su default. La prueba real cubre 21 combinaciones de motor/viewport/DPR y una sola descarga WebP, con el mismo input. Pasan 775 unitarias/15 snapshots, lint/tipos/build y 57 E2E/tres omisiones. La nueva comparación Lighthouse y el caso tradicional siguen pendientes; A/B apagado y Goal activo. [Diagnóstico previo](evidence/performance/responsive-original/verification.md), [corrección verificada](evidence/performance/critical-image/verification.md).

## Opinión compartida verificada en ambas portadas

La consulta existente incorpora el ID público de la columna y solicita retratos independientes en paralelo, conservando orden, límite, fallback y caché. Control/V2 mantienen enlaces de autor separados y usan ID de artículo con respaldo URI. Pasan 770 pruebas/15 snapshots, lint, tipos, build y 46 E2E sin reintentos/cinco omisiones explícitas. La muestra real actual tiene un autor y no permite atribuir una mejora de latencia. No se elimina código ni se activa el A/B. [Contrato, diagnóstico y límites](evidence/analytics/opinion-data/verification.md).



## Mapping GTM preparado desde el export real

El [paquete local](evidence/analytics/gtm/verification.md) conserva el contenedor y la propiedad existentes: dos tags heredados enriquecidos y cuatro tags nuevos pausados, sin importación ni publicación. Pasan siete pruebas CLI, 765 unitarias y lint; no hay cambio runtime ni borrado. Siguen pendientes consentimiento, Preview/DebugView, cohortes/caché, Dailymotion y cierre de rendimiento/PR. El A/B público continúa apagado y el Goal activo.


## Web Vitals nativas y atribución local por navegación

El layout incorpora `useReportWebVitals` con callback estable, condicionado al QA local. LCP/INP/CLS pasan por el `GAEvent`/dataLayer existente con variante, tratamiento y propietario de navegación. Se deduplican callbacks y se conservan revisiones reales; se corrige la atribución de muestras tardías después de expulsar historial. No se envían URLs/entradas/texto ni se añade almacenamiento o dependencia. `web_vital_environment: local-qa` separa estas pruebas de los datos de usuarios reales. [Contrato y evidencia](evidence/analytics/vitals/verification.md).

La revisión independiente aprobó la corrección de historial y los ajustes de test. Pasan 158 suites/765 pruebas/15 snapshots, lint, tipos y build; la matriz final suma 166 ejecuciones E2E aprobadas y 21 omisiones explícitas, incluidos ocho escenarios nativos Chromium con ambos tratamientos. El A/B público permanece apagado. Consentimiento público, cohortes/caché, mapping GTM/GA4, p75 V2 de campo, Dailymotion, matriz de rendimiento final y PR siguen pendientes; este avance no completa el Goal.

17 de octubre de 2026. Goal activo en `feat/home-v2-plan`; experimento sin activar, Home público conservado y preview local opt-in.

## Estado vigente: atribución local de opinión y YouTube en ambos grupos

El control incorpora marcadores opcionales de opinión y video, reutiliza adaptador YouTube/ledger y carrusel V2 con su paso original de 80 %, y conserva sus nombres heredados de clic sin un fallback duplicado. Autor y noticia se distinguen; los componentes compartidos mantienen su default nativo. El SDK del control se enlaza al quedar el iframe realmente visible, con foco como atajo: Firefox no notificaba el foco parental. V2 conserva activación tras clic. Todo usa el propietario y dataLayer existentes; no hay otro transporte ni medición pública activada. [Evidencia](evidence/analytics/control-specialized.md).

YouTube real confirma un único play atribuido al control con fuente intacta. Las fixtures prueban estados, impresiones/clics, feeds consultados una vez y flecha/rueda en tres motores/390–1440 px. Pasan **156 suites/745 tests/15 snapshots**, lint, TypeScript y build. Corridas finales sin reintentos: **129 E2E pasan/nueve omisiones** en foto/general y **29 pasan/cuatro omisiones** en tradicional. Las omisiones y diagnósticos iniciales están documentados, sin relajar visibilidad para ocultar overlays.

Se consolidó el reproductor en `VideoPlayer/ProviderVideo.tsx`, sin retirar funcionalidad, dependencias ni estilos. Knip mantiene cinco candidatos ya clasificados. El grafo inicial suma +5.986 bytes en control y +1.211 en V2 frente a `92f6ae5`; el helper de visibilidad nuevo se difiere para evitar otro coste inicial por ruta. No se presenta como mejora CWV ni aprobación de LCP.

El Goal sigue activo, con A/B público apagado. Próximos pendientes: selector A/B estable/cache aislado y RUM con el transporte actual, consentimiento real/activación tardía, mapping y validación GTM/GA4, Dailymotion con Player ID propio, resolución o justificación explícita de LCP tradicional y comparación final, auditoría de cierre, revisión y PR. No existe muestra V2 de campo mientras el experimento está apagado.

## Verificación previa: YouTube confirmado y carrusel nativo medido en QA

Home V2 reutiliza el propietario de exposición, `GAEvent` y el dataLayer para `PLAY_VIDEO` confirmado por la API de YouTube y una navegación por gesto completado del carrusel. Se atribuyen artículo, módulo, posición, proveedor, variante y tratamiento; el ledger impide duplicar play por pausa/reanudación/remount. El SDK se carga tras activar el video medido y se limpia el player anterior. Preview sin medición no carga la API adicional. Una prueba con YouTube real registra exactamente un play atribuido; fixtures separadas cubren estados y callbacks tardíos. [Contrato y evidencia](evidence/analytics/video/verification.md).

La revisión independiente detectó y se corrigieron dos fallos táctiles: pérdida de intención por `pointercancel` antes del primer scroll y emisión prematura durante una pausa sin soltar el dedo en el fallback. Las pruebas RED→GREEN y gestos reales Chromium con/sin `scrollend` verifican ambos. Flechas/rueda, reproducción fixture, deduplicación y limpieza pasan en los tres motores y ambos tratamientos. No se afirma cobertura táctil física ni ingestión remota GA4.

Pasan **154 suites/737 tests/15 snapshots**, lint, TypeScript y build. Corridas finales sin reintentos: **117 E2E pasan/nueve omisiones** en foto/general, y **29 pasan/cuatro omisiones** en tradicional. Las omisiones están documentadas. El inventario Webpack incluye módulos cacheados; se corrigió la limitación del histórico. V2 incorpora +4.978 bytes iniciales compilados frente al checkpoint anterior; la API propia queda diferida en 1.361 bytes, sin consultas WordPress adicionales. No son CWV ni una aprobación global de rendimiento.

No se eliminan más archivos/dependencias; se preservan control y páginas internas. Continúan pendientes opinión/video del control, Dailymotion con Player ID propio, política de consentimiento, mapping/validación GTM-GA4, RUM y selector A/B apagado, LCP tradicional corto/comparación final, limpieza de cierre y PR. El Goal permanece activo y el A/B público desactivado.

## Verificación previa: menos JavaScript inicial, LCP tradicional aún pendiente

El grafo de Webpack identificó formularios de acceso/registro cargados aunque el diálogo estaba cerrado. Ahora se cargan al abrirlo mediante React.lazy; se preservan callbacks, registro, cierre y reapertura, y se devuelve el foco de teclado al origen, con aviso cancelable reconocido por la medición de oclusión existente. Las librerías de formularios salen de las entradas iniciales: **−144.114 bytes compilados en V2 (8,9 %)** y −143.446 en el control. No se retiraron dependencias ni SDKs usados. Se incorpora análisis de bundles opcional y captura nativa CPU local sin transporte de analítica adicional.

El perfil atribuido a un chunk compartido incluye el planificador de React y trabajo descendiente; no demuestra coste exclusivo de Sentry. Un par CDP de titular corto pasa de 8,076 a 7,804 s, todavía con el sticky como LCP. No es una mejora estadística ni una aprobación. El caso tradicional, la comparación completa y los datos V2 de campo siguen pendientes. [Grafo, pruebas, diagnóstico y límites](evidence/performance/client-startup/verification.md).

Pasan 151 suites/726 tests/15 snapshots, lint, TypeScript y build. Pasan además 81 E2E sin reintentos en los tres motores, incluidos acceso/teclado, anuncios, dataLayer y páginas internas. El A/B permanece apagado y se mantienen pendientes video/opinión, consentimiento público, GTM/GA4, selector estable/cache, comparación de cierre, limpieza final y PR. Goal activo.

## Verificación previa: diagnóstico de LCP sin ocultar el caso desfavorable

`62fce8a` elimina la espera de idle del sticky fijo del viewport; conserva popup, selección, IDs, cierre, dimensiones y contador existente. Una prueba con callbacks retenidos demuestra una creatividad disponible antes de idle y una consulta compartida. No se atribuye a este cambio una mejora global de LCP que las mediciones no prueban.

La portada tradicional con el titular actual resulta LCP rápido de laboratorio, pero eso no cubre todas sus noticias: una fixture **SSR** de 32 caracteres deja el LCP en el anuncio y registra **7,960 s** bajo throttling CDP, con campañas solicitadas a los 6,055 s. HTML y React contienen el mismo texto, sin alterar datos cacheados ni registrar errores de hidratación observados. La exploración que mutaba texto en el DOM se descarta como comparativa. El área del candidato editorial importa; no se atribuye todo el cambio histórico a contenido sin comparar snapshots exactos.

El script reproducible `scripts/home-v2/lcp-headline-probe.mjs` usa Node 24/Chrome y contextos nuevos, no RUM, ni un nuevo emisor analítico. Rechaza evidencia incompleta y sobrescrituras. [Informe, datos y metodología](evidence/performance/lcp-conditional/verification.md).

Pasan **150 suites/725 tests/15 snapshots**, lint, TypeScript, build y **69 E2E sin reintentos**, incluidos control/tradicional, publicidad, fixture SSR, analítica y navegación por páginas internas en tres motores. No se retiraron dependencias, archivos ni estilos. El A/B permanece apagado. **El rendimiento tradicional sigue sin aprobarse**: falta analizar/reducir el arranque JS/hidratación anterior a campañas y completar comparación equivalente y datos de campo. Continúan también video/opinión, política de consentimiento, GTM/GA4, selector A/B apagado, limpieza de cierre y PR; el Goal sigue activo.

## Verificación previa: clic único nativo, control y lectura eficiente

`db93986` añade atribución a rankings y servicios del control, sin cambiar sus consultas, ventanas ni presentación. Distingue rankings de siete días en móvil, cinco días y un día en escritorio. Los defaults compartidos conservan páginas internas. El mismo propietario analítico mide control/V2, con A/B público apagado.

Se corrigió un duplicado del montaje QA: el fallback en una microtarea podía adelantarse al handler delegado de React. Ahora espera una tarea posterior, conserva las etiquetas heredadas y las pruebas comprueban el **total** de clics, incluido el subconjunto sin atribución. Las pruebas previas que solo filtraban eventos experimentales no bastaban para demostrar ausencia de duplicados globales.

El observer de lectura mantiene únicamente texto intersectando para sus comprobaciones periódicas. La fixture de artículo largo pasa de 4.378 a 22 lecturas de geometría en dos segundos, con cero lecturas de párrafos fuera de pantalla; no se presenta como mejora de INP/CWV. [Comparación acotada](evidence/analytics/reading-visible-text-cost.json).

Pasan **150 suites/725 tests/15 snapshots**, lint, TypeScript y build. La matriz final tiene **37 E2E aprobados sin reintentos**, más dos muestras temporizadas omitidas explícitamente: control móvil/escritorio, analítica existente, lectura y navegación de Home/categoría/artículo en los tres motores. Una primera corrida dejó un marcador realmente fuera de pantalla por contenido tardío; se corrigió el encuadre de prueba, sin relajar visibilidad. [Contrato y evidencia](evidence/analytics/control-modules-and-native-clicks.md).

No se retiraron nuevas dependencias ni archivos. El siguiente trabajo prioritario es resolver la regresión de LCP tradicional y continuar las señales reales de video/opinión, consentimiento/GTM/GA4, selector A/B apagado, validación final, limpieza de cierre y PR. El Goal permanece activo.

## Verificación previa: destino y segunda noticia en QA local

`e28a3c7` conecta el origen del clic Home con los artículos realmente visibles, usando exclusivamente `GAEvent` y el dataLayer existente. Se deduplican apertura, segunda noticia y 30 s de engagement por artículo/sesión editorial, incluyendo coordinación entre pestañas y conservación de contexto/tiempo por artículo. Titular, cuerpo, foco, clipping y overlays determinan exposición y lectura; append invisible no cuenta.

El adaptador se importa de forma diferida y requiere **permiso explícito de QA local** (`HOME_V2_READING_QA_CONSENT=granted`, además de los flags anteriores, en build y arranque). No es una CMP ni habilita el experimento. Con permiso usa estado editorial público bajo Web Locks, sin ID de lector; sin storage/bloqueo limita cobertura a memoria. La revocación vacía el estado y detiene el adaptador. El timeout editorial de 30 min todavía debe contrastarse con la configuración real de GA4.

Pasan **150 suites/721 tests/15 snapshots**, lint y build. Pasan **28 E2E sin reintentos**: seis recorridos móvil/escritorio de apertura/segunda pestaña/recarga, tres primeras noticias abiertas directamente en otra pestaña, un engagement temporizado de control con revocación y 18 regresiones analíticas de Home. Los tres motores cubren aperturas; el temporizado de 30 s se ejecuta en Chromium y omite explícitamente Firefox/WebKit. Para WebKit se usa una fixture `target=_blank` porque su entrada de botón medio no creó otra página en la primera corrida. [Evidencia y límites](evidence/analytics/reading-destinations.md).

No hay nuevas dependencias ni eliminaciones; siguen preservados control, páginas internas, publicidad y vistas existentes. El chunk diferido de lectura mide 11.793 bytes decodificados; los tamaños de build no son CWV ni un presupuesto global aprobado. Sigue pendiente perfilar el sondeo en artículos largos, resolver LCP tradicional y completar comparación equivalente, módulos especializados del control, video, política real de consentimiento, GTM/GA4, A/B apagado y PR. El Goal sigue activo.

## Verificación previa: impresiones con oclusión y denominadores separados

El template usa un propietario por navegación para enriquecer su vista existente sin duplicación en StrictMode, esperar contenido tardío y conservar el origen del clic. La validación manual local conecta apertura/columnas del control y módulos V2 al `dataLayer` existente; filtros, servicios, ranking y «Ver más» quedan atribuidos. Los tokens de exposición son UUID efímeros en memoria, sin identidad ni almacenamiento nuevo. El build normal ignora la URL de QA; no hay asignación pública ni cookie A/B.

`b50a686` descuenta la unión de los rectángulos del menú, login/modal, header, anuncios popup/sticky y banners sociales, además del viewport y ancestros que recortan. Se exige 50 % descubierto durante un segundo continuo; el sondeo común solo atiende candidatas intersectando y se libera al terminar. `c485def` separa el titular de entrada del módulo de la tarjeta completa y reconoce la apertura del control cuando su sección es también el target del artículo. Ver un titular no fabrica una impresión de la tarjeta.

Pasan **146 suites/702 tests/15 snapshots**, lint y build. En los tres motores pasan **30 E2E de overlays reales**, **18 analíticos foto/control**, **12 analíticos tradicional/control** con apertura de módulo explícita y **45 E2E funcionales**. Las corridas finales usan salidas aisladas y cero reintentos. La muestra de coste DOM detecta actividad mientras el menú cubre candidatas y cero lecturas tras finalizar las exposiciones; no es CPU total ni Core Web Vitals. Faltan módulos especializados del control, BFCache real completo, lectura/segunda noticia en destino y video confirmado/carrusel. Ingestión GTM/GA4, RUM por variante, arquitectura final de caché y regresión LCP tradicional siguen pendientes. [Regla, alcance y evidencia](analytics.md#visibilidad-con-superficies-propias-superpuestas).

`c096254` permite presentar campañas directas mientras sigue pendiente la configuración de otros slots; conserva fallbacks tardíos, selección, targeting, plazo/cierre del popup y conteo único. Prueba reteniendo configuración durante 3,5 s: antes cero solicitudes de imagen, ahora una. Build/lint y **144 suites/677 tests/15 snapshots** pasan; **36 E2E control/tradicional y 45 control/fotográfica** pasan en los tres motores. Doce corridas focalizadas Lighthouse verifican la dependencia eliminada, pero mantienen una regresión significativa de LCP tradicional pendiente de resolver. [Detalle y límites de la medición](performance.md#campañas-directas-disponibles-sin-esperar-configuración-ajena).

La portada modular y sus dos tratamientos están en preview local; el montaje analítico descrito no completa los adaptadores ni la validación remota. La asignación pública A/B sigue apagada. Hay baseline CrUX real del Home público (móvil p75 1,7 s/195 ms/0,08; escritorio 1,7 s/104 ms/0,09); no existe muestra de campo V2. Dos consultas huérfanas se retiraron tras comprobar referencias y regresiones; el legado del control se conserva. Faltan comparación final, cierre de aceptación, revisión y PR. Storybook conserva el fallo previo de versiones incompatibles.

Los apartados siguientes son el historial de etapas; sus recuentos y pendientes corresponden al momento indicado, no sustituyen este estado vigente.

## Evidencia alcanzada

- Requisitos y 12 fases documentados antes de modificar código.
- Auditoría de implementación analítica, recurso publicado GTM v32 y propiedad GA4 en lectura. El contenedor necesita ampliar variables/parámetros y triggers; no se ha publicado una integración nueva.
- Build del control en Node 24 y baseline de 20 corridas Lighthouse (5 por dispositivo/caché), red de navegador, bundles transferidos y consulta SSR tras invalidación local.
- Knip inicial contrastado con uso real: plugins CSS preservados; no hay archivos ni dependencias eliminados.
- Capa de datos V2 aislada: configuración de ocho módulos, orden/deduplicación editorial, portada determinista y fallback sin foto; taxonomías paginadas con índice de descendientes y protección frente a ciclos.
- Clientes modulares existentes ampliados: una petición de taxonomías y una GraphQL con aliases para los ocho módulos; sin cuerpos de artículos ni información personal. Prueba contra WordPress real: 12 regiones, ocho módulos completos y cero errores. [Resultado](evidence/editorial-live-smoke.json).
- Caché de datos explícita de una hora, compartida por render y con tags de revalidación existentes. Las nuevas consultas evitan la caché interna semanal que haría ineficaz ese TTL. Los resultados parciales se pueden presentar sin conservar el fallo durante una hora.

La prueba de datos real midió aproximadamente 3 s en frío para reunir ocho módulos, incluyendo taxonomías y procesamiento. **No es una mejora de LCP ni una comparación directa con la portada actual:** faltan composición/streaming, módulos especializados y perfil completo de V2.

## Verificación de esta etapa

- `npm run test:unit -- --runInBand`: **128 suites, 582 tests, 15 snapshots pasan** (24 tests nuevos).
- `npm run lint`: pasa sin errores ni warnings tras excluir las copias de trabajo generadas.
- `npm run ts:compile`: pasa.
- `npm run build`: pasa en Node 24.19.0; conserva avisos existentes de Sentry y CSS. El archivo SEO regenerado se restaura fuera del cambio.
- HAR móvil/escritorio saneados, enlaces locales y 20 resultados Lighthouse comprobados; `node --check scripts/home-v2/lighthouse.mjs` pasa. El runner extraído todavía debe ejecutarse contra V2.
- Prueba real de la capa editorial contra WordPress: dos POST, ocho módulos y cero errores. Esto no prueba todavía el comportamiento completo de Home V2.

## Decisiones de implementación y límites

- Se continúa en la rama solicitada, sin crear otra copia del proyecto. Se comprobó que los servidores existentes en 3000/3100 pertenecían a otros proyectos y se usó exclusivamente 3212 para el control.
- La orquestación pura está en `loadHomeV2Data.ts`, separada de `getHomeV2Data.ts` para probar flujos reales sin depender del runtime de caché de Next. El contrato editorial no cambia por esta separación.
- Se reutiliza `canonicalPath` para identidad por URI; las posiciones son editoriales, no posiciones CSS.
- El modelo de tarjeta incluye solo campos que realmente devuelve la consulta, sin exigir cuerpo, paginación o propiedades de presentación de los tipos antiguos. El control conserva sus tipos y consumidores.
- Se corrigió la referencia obsoleta de Prettier a un `tailwind.config.js` inexistente, usando el stylesheet Tailwind v4 actual. ESLint excluye únicamente workspaces generados `.superpowers/` y `.kilo/worktrees/`; no se desactivaron reglas de aplicación.
- Campo: PageSpeed responde 429; no hay muestra V2 porque el A/B permanece apagado. No se certifica p75 desde Lighthouse.
- Consentimiento: la sesión de auditoría local observó estados `implicit: true` en GTM, sin un default/update explícito. Está pendiente identificar el gestor/política existente; no se añade una CMP por inferencia.
- Las variables nuevas aún no llegan a GA4: el contenedor actual solo transmite parámetros antiguos. Las pruebas locales futuras no sustituirán la validación remota del mapping.

## Próximo trabajo requerido

1. Componentes editoriales de servidor y apertura fotográfica/tradicional basadas en la referencia, con islas cliente pequeñas.
2. Módulos de últimas publicaciones, videos, opinión, BCV, servicios y sidebar/publicidad; completar sus datos sin solicitudes redundantes.
3. Filtro regional con consulta bajo demanda cacheada, pruebas de cambio/retorno y deduplicación de impresiones.
4. Instrumentación en la utilidad dataLayer existente, visibilidad, segunda noticia y lectura en destino; mapping preparado para GTM existente y política de consentimiento confirmada.
5. Preview de QA y asignación A/B estable con separación de caché, apagada por defecto; no distribuir tráfico real.
6. Perfil comparativo de V2, corrección de regresiones, auditoría final de limpieza, pruebas visuales/E2E y PR.

La capa de datos inicial no completa las fases 3–12 ni los criterios de aceptación. Los detalles y comandos quedan en el plan y en los informes; no cerrar el Goal con estos resultados parciales.

## Avance: componentes y preview local de producción

- Diez módulos editoriales: los ocho iniciales más videos y últimas publicaciones. Una conexión adicional dentro del mismo POST GraphQL por módulo nuevo, sin un POST independiente por componente. Las últimas publicaciones pueden repetir una noticia de otro módulo deliberadamente; la deduplicación local de cada lista permanece activa.
- Apertura fotográfica/tradicional automática, tarjetas reutilizables, tres columnas de secciones, filtro regional bajo demanda, últimas publicaciones, carrusel nativo de videos, BCV, ranking, opinión, servicios y sidebar con `NcolAdSlot` existente. Se mantienen IDs e integraciones de anuncios. No se usa una librería nueva de carrusel/sticky.
- Contenido editorial en Server Components; islas cliente para imágenes con fallback, filtros, reproductor y feeds existentes. Derivados WordPress con `sizes`/`srcset`, prioridad solo a imagen principal y carga diferida fuera de pantalla. Dimensiones reservadas incluso al fallar la imagen.
- `/home-v2-preview/` devuelve 404 por defecto. Solo se habilita localmente con `HOME_V2_PREVIEW_ENABLED=true`, sin `VERCEL`/`VERCEL_ENV`; metadata noindex/nofollow y exclusión de sitemap. No habilita reparto A/B. `src/app/page.tsx` permanece intacto.
- La vista QA excluye la utilidad dataLayer existente, GTM y contadores de anuncios para no contaminar mediciones. Los tests mantienen la emisión de contadores en rutas públicas. Esto **no es todavía instrumentación de Home V2**.

Verificación fresca sobre build de producción Node 24.19.0: **136 suites, 611 tests, 15 snapshots**, lint y build pasan. Cinco E2E Chromium pasan: layouts de 1440/390px, imagen fallida sin cambio de dimensiones, filtro regional con una sola Server Action al seleccionar/volver, reproductor diferido con teclado, QA sin tracking y control público 200. Se comprobó también preview 404 con flags apagados. [Navegador escritorio](evidence/ui/desktop.json), [móvil](evidence/ui/mobile.json), [captura escritorio](evidence/ui/desktop-fold.png), [captura móvil](evidence/ui/mobile-fold.png).

La inspección real conserva un error existente de OneSignal por ejecutar fuera del dominio de producción; no se amplía ese trabajo. **Storybook no compila**: el manifiesto de la rama base combina Storybook 8 con `@storybook/nextjs` 10 y falla al resolver presets/exports antes de compilar las stories. No se actualizan dependencias de forma lateral; las stories de apertura quedan preparadas y su compilación pendiente de un trabajo de compatibilidad.

Estos resultados son funcionales/visuales, no comparaciones de rendimiento. La preview excluye GTM, mientras el baseline lo incluye: no comparar sus tiempos como una mejora. La comparación siguiente requiere condiciones equivalentes de scripts y caché. Quedan pendientes eventos de visibilidad/deduplicación, segunda noticia/destino, asignación A/B apagada, mapping remoto GTM/consentimiento, perfil comparativo y auditoría final/PR.

## Avance: reglas de analítica con el transporte existente

Se amplió `ga.ts` con contexto opcional y limpieza de sus campos después del evento. Se prepararon reglas de visibilidad, ledger de impresiones, enlace delegado y estado de segunda noticia/lectura sujeto a permiso explícito. **140 suites/634 tests/15 snapshots pasan**, con 23 casos nuevos. [Contrato y límites actuales](analytics.md#núcleo-implementado-y-probado-activación-pendiente). Se excluye `storybook-static/**` del lint: es salida compilada ignorada por Git, no código fuente; los errores de complejidad de las funciones nuevas se corrigieron sin desactivar reglas.

El núcleo aún no se monta en Home: faltan propietario de exposición/vista única, consentimiento vigente, adaptadores de destino/video y conexión control/V2. No se acredita ingestión GA4 ni se marca aceptación analítica. A/B permanece apagado.

## Avance: limpieza segura con regresiones

Se retiraron únicamente `getAllCategoriesWithSlug/query.ts` y `getAllPostsWithSlug/query.ts`, consultas literales sin consumidores ni entrada de framework. Knip Node 24 pasa de siete candidatos a cinco; sus demás hallazgos se clasifican y preservan. No se retira ninguna dependencia ni código del control. [Informe y evidencia](dead-code-audit.md).

Tras la eliminación pasan **140 suites/634 tests/15 snapshots, lint, build y 18 E2E** en Chromium, Firefox y WebKit. Los E2E cubren preview de 1440/390px, fallback sin CLS geométrico, filtro con caché, video por teclado y navegación real por Home actual, categorías y artículo. La recopilación de eventos públicos de QA se bloquea en la prueba; preview debe producir cero intentos. Esto verifica la limpieza acotada, no la instrumentación ni Core Web Vitals de campo.

## Avance: diagnóstico comparativo, todavía sin aprobación

Se completaron otras **60 corridas Lighthouse**: control, V2 con foto y tradicional sin imagen, cinco por dispositivo/caché. Se preservó el baseline original y se guardaron resúmenes/causas/recursos y hashes de los archivos crudos, fuera de Git. [Resultados y regresiones](performance.md#diagnóstico-previo-a-optimizaciones-60-corridas).

La foto reduce CLS móvil a ~0,032, pero aumenta LCP móvil caliente **223 ms**. La tradicional tiene una regresión mayor: el anuncio `sticky-bottom` pasa a ser el elemento LCP. No se aprueba el rendimiento. Se descubrió además un tag de destino GTM ausente en preview al excluir su page view: la comparación final debe conservar el evento existente desde la misma ruta local, con colectores bloqueados, antes de repetir perfiles. No se añade otro tracking.

Se probó el endpoint de revalidación local existente: V2 reconstruye diez módulos con dos POST WordPress y luego reutiliza datos sin POST; control SSR usa uno y luego HIT. Los **3,6 s de reconstrucción fría V2** requieren revisión de campos, caché y arquitectura final. La preparación de auditoría pasa **142 suites/643 tests/15 snapshots, lint/build y 18 E2E**. Campo sigue sin muestra; A/B permanece apagado y no hay PR ni despliegue.

## Corrección de equivalencia del comparador local

La selección manual en raíz requiere dos flags y loopback; no asigna cohortes ni cookies. Reutiliza la vista y los scripts existentes desde la misma URL visible, con título exacto y colectores bloqueados. Preview directa sigue excluyendo tracking. Pasan **63 pruebas unitarias dirigidas, lint, build y tres E2E** (Chromium, Firefox y WebKit) que exigen un solo `CUSTOM_PAGE_VIEW`, GTM y tag de destino en cada variante. La primera prueba con guardas de Vercel activas rechazó correctamente preview; la segunda descubrió el sufijo de título y produjo una prueba de regresión antes de corregirlo. [Procedimiento reproducible](performance.md#comparación-emparejada-preparación-de-condiciones-equivalentes).

No se repite todavía la matriz: una captura de viewport móvil demuestra ocho imágenes editoriales solicitadas a más de 2.000 px de altura antes de hacer scroll. Se prepara una reducción de carga anticipada y una corrección del fallback al cambiar de imagen regional; falta medir su resultado. El Goal continúa activo, sin aceptación final de rendimiento ni activación A/B.

## Optimización de carga de imágenes

Se reutiliza el observador compartido para cargar imágenes a 200 px del viewport, manteniendo geometría, imagen crítica SSR y fallback si falta la API. Precarga responsive solo para la crítica, y recuperación del `srcset` al sustituir una imagen fallida por otra. Solicitudes editoriales antes de scroll: **17→5 móvil**, **21→9 escritorio**; las ocho descargas móviles a más de 2.000 px se reducen a cero. El botón de calculadora mantiene una sola fila y altura táctil mínima. [Evidencia y límites](performance.md#optimización-de-imágenes-verificada-comparación-final-pendiente).

Pasan **143 suites/656 tests/15 snapshots, lint/build y 21 E2E** en los tres navegadores. Las regresiones Lighthouse detectadas previamente continúan abiertas hasta la comparación final; no se atribuyen resultados de campo a estas capturas. La inspección autenticada de GTM confirma acceso al workspace sin cambios y consentimiento adicional sin configurar; falta confirmar la política vigente y conectar los adaptadores de medición. No se publicó configuración ni se activó A/B.

## Atribución del origen y URLs de artículos

El núcleo conserva `origin_article_id` al cambiar `article_id` en destino; el nuevo campo se limpia mediante el mismo dataLayer después del evento. Acepta rutas reales con año o categoría legada, elimina query/hash y rechaza otros protocolos/meses/días inválidos. Deduplica aperturas y engagement por ID WordPress para que un alias no cuente como segunda noticia, y conserva tiempo activo del mismo artículo entre alias. La instantánea de sesión cambia a versión 2 antes de cualquier montaje público. Pruebas nuevas fallaron primero para estos casos y después pasaron; no se ha activado almacenamiento ni seguimiento del experimento.

Verificación: suite completa **143/666 tests/15 snapshots**; después de simplificar una expresión señalada por lint, **77 pruebas dirigidas**, lint y build pasan. Tres E2E frescos confirman que las vistas y tags existentes siguen emitiéndose una sola vez. Las capturas fotográficas tras recorrido completo muestran imágenes cargadas, un h1 y sin overflow en 390/1440 px; [registro visual](evidence/ui/loaded/verification.json), [escritorio](evidence/ui/loaded/1440-full.png), [móvil](evidence/ui/loaded/390-full.png). Conservan overlays publicitarios existentes y no equivalen a aprobación visual final ni medición de rendimiento. Persiste el error local conocido de OneSignal por dominio de producción.

Pendientes centrales: política de consentimiento y adaptación de runtime, exposición única/retorno, clics control/V2, filtros/video real/destino y GTM Preview/GA4; selector A/B estable apagado; estrechar campos editoriales y revisar caché de ruta; corregir publicidad/CLS y LCP tradicional; comparación final y muestra de campo; revisión/PR. El Goal sigue activo.

## Reducción de campos editoriales

La consulta agrupada solicita extractos/bandera de destacado solo para apertura, URLs de video solo para Videos y elimina slug redundante/parentId de tarjetas. El árbol compartido conserva las relaciones de taxonomía. Se versionan claves de datos principal/regional; TTL de una hora e invalidación permanecen vigentes. El control y las otras APIs no cambian.

El probe de lectura WordPress antes/después confirma mismos IDs ordenados en diez módulos y mismo destacado, con dos POST en ambos casos. JSON editorial decodificado **151.070→97.371 bytes (−35,5 %)**; extractos **97→10**, flags de destacado 10 y campos de video 12. [Informe con hashes](evidence/performance/data/fields-comparison.json). Una muestra por implementación acredita campos/volumen, sin aprobación de latencia, bytes comprimidos ni CWV.

Pasan **143 suites/667 tests/15 snapshots, lint/build y 21 E2E** de producción en los tres motores, incluidos filtro regional cacheado, embed diferido y navegación por control/categoría/artículo. Quedan abiertos los demás pendientes del apartado anterior, salvo este estrechamiento de campos ya verificado. No se repite todavía la matriz final mientras falten arquitectura/analítica de runtime y correcciones publicitarias. A/B sigue desactivado.

## Estabilidad del anuncio fijo compartido

El sticky mostraba su botón y contaba una vista antes de cargar la creatividad; la llegada de la imagen hacía saltar los controles. Se conserva el único `<img>` y su solicitud; el frame aparece al disponer de dimensiones naturales y el contador existente comienza tras la primera carga. Resize cambia la fuente sin duplicar la vista. Se consolidan los efectos responsive en el hook existente; error/no-fill y contenido de terceros permanecen cubiertos.

La reproducción controlada baja el desplazamiento del sticky **0,0304→0 móvil / 0,0402→0 escritorio** en control y V2, con una sola descarga y vista, usando piezas de dimensiones ajenas al catálogo para evitar una reserva supuesta. [Evidencia y límites](performance.md#anuncio-fijo-controles-estables-cuando-la-creatividad-está-disponible). Pasan **143 suites/670 tests/15 snapshots, lint/build y 33 E2E**. Los conteos históricos de creatividades vacías no son un baseline válido de exposición publicitaria; no se certifican ingresos/IAB ni CWV de campo con esta prueba. Queda pendiente LCP tradicional, anuncios en flujo y comparación final. El Goal sigue activo y A/B apagado.

## Campo disponible del sitio público y diagnóstico intermedio

Se recuperó CrUX desde la UI oficial de PageSpeed: alcance **esta URL** del Home actual, ventana **17-09→14-10-2026**, p75 móvil **LCP 1,7 s / INP 195 ms / CLS 0,08** y escritorio **1,7 s / 104 ms / 0,09**. Ambos figuran aprobados. La muestra se describe como `Many samples`, sin número; son datos históricos de producción, sin atribución a esta rama ni a V2. [Registro y fuente](evidence/performance/field/crux-control-2026-10-17.json). Se mantiene documentado el fallo 429 inicial y se reemplaza su estado pendiente del control por esta observación verificada. V2 continúa sin muestra de campo.

El [punto de control de 18 corridas Lighthouse](performance.md#punto-de-control-tras-las-optimizaciones-sin-aprobación-final) conserva valores atípicos y tiene solo dos pares móviles/un par escritorio por variante: no es aprobación final. CLS V2 local mejora, pero tradicional conserva una regresión importante de LCP. La traza y una prueba de respuesta retenida confirman una causa accionable: `fetchAllAds` espera configuración de otros slots antes de devolver campañas directas listas. La próxima corrección debe eliminar esa dependencia conservando selección, fallbacks, consultas deduplicadas y temporizador del popup. Analítica completa, A/B apagado, comparación final y PR siguen pendientes.

## Apertura tradicional compacta y validación de tres tamaños

La inspección visual de escritorio encontró una apertura tradicional de **544 px**, porque sus secundarias conservaban las fotografías anchas del tratamiento fotográfico y dejaban una columna de texto casi vacía. La prueba de navegador falló primero con 543,7 px; después se corrigieron a miniaturas de **92 px**, con `sizes` acorde y una sola columna bajo 1024 px. La apertura medida queda en **193,2 px** con el contenido observado. Se mantienen las noticias, posiciones, h1 y consultas; la corrección no se presenta como solución de LCP.

Pasan **24 E2E** con fixture tradicional en Chromium/Firefox/WebKit, incluidos nueve casos de apertura en **390/900/1440 px**, sin preload principal ni imagen fantasma. Una regresión separada conserva **33 E2E** de la versión fotográfica/control, fallback de imagen estable, filtros, videos, categorías y artículo. **143 suites/670 tests/15 snapshots, lint/build pasan**. [Registro visual](evidence/ui/traditional-loaded/verification.json), [antes en escritorio](evidence/ui/traditional-loaded/desktop-before.png), [después](evidence/ui/traditional-loaded/1440-fold.png), [móvil](evidence/ui/traditional-loaded/390-fold.png). Las capturas tras scroll tienen imágenes cargadas, sin overflow y cero eventos QA; incluyen overlays publicitarios existentes.

Continúa el trabajo de datos publicitarios, analítica de runtime/atribución, validación GTM/GA4, preparación A/B apagada y comparación final. Storybook conserva su fallo previo de versiones incompatibles; no se acredita con estas pruebas. El Goal permanece activo.
