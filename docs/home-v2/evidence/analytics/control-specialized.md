# Opinión y video del control: atribución local y compatibilidad

17-10-2026. Base de esta etapa: `92f6ae5`. Goal activo, A/B público apagado. [Datos, hashes y resultados](control-specialized.json). No acredita consentimiento público, ingestión GTM/GA4 ni aceptación final de rendimiento.

## Opinión

`OpinionAuthorsWidget` admite `homePosition` opcional. Home declara `opinion` en posición 4 del sidebar y 8 del flujo móvil, manteniendo sus lugares y CSS existentes. Solo el enlace de la última columna lleva identidad/URI pública, posición de tarjeta y tipo `compact_card`; nombre/foto del autor mantienen navegación de autor y no se confunden con una noticia. «Ver más» usa el contrato `section_link`. Skeletons no tienen artículo y el propietario no registra módulos vacíos.

La misma medición visible y el ledger existente evitan impresiones por el ejemplar responsive oculto o por rerenders. No se envían nombres ni datos de perfil al dataLayer. El hook, endpoint y deduplicación SWR permanecen iguales; la fixture de navegador exige una consulta de autores durante el recorrido.

## Video y carrusel

El control declara módulo `videos`, posición editorial 5 y tarjetas con ID público WordPress, URI, sección real, posición y tipo `video_card`. Conserva iframes directos, dimensiones, permisos y ausencia de autoplay. La preparación de parámetros API (`enablejsapi`/`origin`) se solicita desde Home solo con los flags existentes de auditoría **local** y guardas de Vercel. `VideoPlayer` compartido conserva por defecto su iframe nativo; artículo y página de videos no solicitan ese modo.

El adaptador de V2 se reubica de `HomeV2/ActivatedVideo.tsx` a `VideoPlayer/ProviderVideo.tsx`, con una implementación común. Modo `activated`: mismo autoplay tras el clic y misma observación de V2. Modo `embedded-home`: prepara el iframe desde su creación sin modificar luego el `src`; la utilidad existente `observeVisible` permite enlazar la API cuando el iframe queda 50 % descubierto durante un segundo. Foco/blur son un atajo opcional, nunca prueba de play. **Firefox no produjo eventos parentales de foco/blur al pulsar la fixture interna**, por lo que ese atajo por sí solo era insuficiente.

La utilidad se importa dinámicamente solo en ese modo. Las promesas comprueban desmontaje e inicio previo antes de crear el observer; su limpieza se ejecuta al iniciar el SDK y al desmontar. El template sigue utilizando la utilidad para otras impresiones: import diferido no significa que todo su código esté ausente del grafo inicial. La API se comparte y solo se inicia con un propietario Home activo. Sin propietario no se carga el SDK ni se atribuye una reproducción experimental. El caso de consentimiento/propietario concedido tardíamente todavía requiere la integración pública pendiente.

Solo el estado YouTube PLAYING (`1`) confirma `PLAY_VIDEO`; SDK cargado, iframe visible, clic, foco, pausa o buffering producen cero reproducciones. Se reutilizan el ledger y el payload de V2. En un Home medido se suprime la señal heredada de blur de `VideoCard`, evitando una reproducción falsa o duplicada. Fuera de ese propietario se preserva su comportamiento anterior; esa señal pública heredada continúa sin certificarse como reproducción real. Dailymotion no fabrica confirmación y sigue pendiente de Player ID propio.

El carrusel reutiliza `mountVideoCarousel`, incluyendo finalización nativa, touch y fallback ya probados. Conserva el paso original del control de **80 % del ancho**, frente al ancho completo de V2. Evita reinstalar listeners por un array de posts nuevo en cada render. Scrolls programáticos no cuentan; flecha/rueda requieren cambio efectivo de tarjeta inicial. El player de origen cruzado administra los gestos dentro del iframe: los tests de rueda se ejecutan sobre el pie editorial, donde realmente puede desplazarse el carrusel, sin interceptar controles del proveedor.

Los enlaces conservan **`CLICK_POST_LINK` y `CLICK_VIEW_NEWS`, categoría `VIDEO_WIDGET`**. `GAEvent` reconoce esos dos clics dentro del gesto Home existente y consume el fallback: un clic no genera además un `CLICK_EVENT`. RED→GREEN confirma dos eventos antes y uno después. Clic de categoría, play y eventos ajenos no se convierten en clic de artículo ni cambian sus nombres.

## Evidencia real y fixtures

Chrome 155, contexto nuevo 1440×1000, feed editorial real y YouTube sin interceptar: pulsar el botón accesible **Play video** del player confirmó exactamente **un `PLAY_VIDEO`** con experimento `home_v2`, variante `control`, tratamiento `current`, módulo, artículo y puesto. Se mantuvo el mismo `src` del iframe. GA collect y `/api/track` estaban bloqueados; anuncios devolvían listas vacías de fixture. Es una comprobación del proveedor, no RUM, ingestión GA4 o validación publicitaria.

Los intentos anteriores sin activación se conservan como diagnósticos fallidos: buscaban una clase CSS antigua del player. La inspección del DOM real encontró `ytmCuedOverlayPlayButton` y el nombre accesible usado por la prueba válida. No se cambiaron datos editoriales ni se simuló PLAYING para esta comprobación real.

Los 12 E2E específicos usan fixtures separadas para estados SDK y feeds: tres motores, 390/1440 px. Verifican módulo/tarjeta realmente visibles, navegación de autor sin clic de artículo, un clic por enlace, ausencia de autoplay, cero play antes de confirmar, deduplicación, fuente intacta, flecha/rueda y una consulta por feed. Las pruebas se desplazan primero al placeholder real del carrusel para activar su carga diferida.

La regresión general inicial tuvo un fallo de encuadre: el marcador de servicios estaba dentro del viewport pero cubierto por WhatsApp; cero impresiones era correcto. El test ahora desplaza ese marcador al centro y sigue exigiendo un segundo descubierto. No se cambia el umbral, el overlay ni la aplicación para obtener el evento. Pasan **156 suites/745 tests/15 snapshots**, lint, TypeScript y build. La corrida foto/general tiene **129 E2E aprobados/nueve omisiones**, la tradicional **29 aprobados/cuatro omisiones**, con cero reintentos. Las omisiones son touch fuera de Chromium/CDP, dos lecturas temporizadas Firefox/WebKit y tres casos que requieren otro build con QA apagado. Los hashes se registran en el JSON enlazado; no se presentan las corridas fallidas como aprobadas.

## Rendimiento y limpieza

Unión de JS inicial compilado (main-app/layout/template/página), contrastada con archivos físicos: **control 1.518.357 bytes / 28 assets; V2 1.479.082 / 25**. Frente a `92f6ae5`, +5.986 y +1.211 bytes respectivamente. Diferir la nueva dependencia de visibilidad evita 4.611/4.307 bytes iniciales frente a la implementación intermedia; no es una mejora de latencia ni una comparación de campo. El adaptador YouTube propio sigue diferido, 1.361 bytes.

La prueba con YouTube real observó 993 y 27.038 bytes decodificados para los dos scripts API, 28.031 en total tras acercarse al video. Excluye player/UI/medios y otros recursos; no representa tráfico comprimido ni coste total. No se añaden dependencias o consultas WordPress. El LCP tradicional corto (~8 s en el diagnóstico anterior), INP/hidratación completos, matriz final y muestra V2 de campo siguen pendientes.

Knip Node 24 vuelve a señalar **los mismos cinco archivos candidatos**; termina con hallazgos, no con una auditoría limpia. No identifica archivos nuevos huérfanos del adaptador. Se conserva la clasificación del informe principal, incluidos control, rutas dinámicas, configuración CSS/build y candidatos de trabajo separado. El export del path de preview tiene uso interno real y el tipo `HomeVariant` sigue reservado a la fase A/B pendiente; no se borran para silenciar el análisis.

La única reubicación de esta etapa es el reproductor común; no se elimina funcionalidad ni se retiran dependencias/estilos. Las dos consultas huérfanas eliminadas anteriormente mantienen su evidencia y pruebas. La limpieza posterior al experimento sigue separada. La revisión independiente aprobó el cambio y sus dos ajustes de visibilidad/import diferido; excluyó consentimiento, rollout, Dailymotion y aceptación global.

## Validación reproducible y pendientes

Node 24.19.0; build/arranque con los flags locales ya documentados, `VERCEL`/`VERCEL_ENV` vacíos y puerto 3212. Ejecutar `HOME_V2_CONTROL_EDITORIAL_E2E=true E2E_BASE_URL=http://localhost:3212 pnpm exec playwright test e2e/home-control-editorial.spec.ts --retries=0`, usando salidas HTML/resultados únicas. Los colectores quedan bloqueados en el spec.

No se publica GTM ni se activa A/B. Faltan Player ID Dailymotion, política de consentimiento real/activación tardía, mapping de estos nombres heredados en GTM, Preview/DebugView, RUM/selector estable apagado, rendimiento final y PR. Se conserva el alcance completo del Goal.
