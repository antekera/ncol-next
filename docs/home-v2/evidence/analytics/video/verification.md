# Video V2: señal del proveedor y navegación completada

17-10-2026. Alcance: implementación local opt-in, mismo propietario de exposición y `GAEvent`/dataLayer. El experimento público sigue apagado. [Datos, hashes y gates](diagnostic.json).

## Comportamiento y deduplicación

- YouTube: API oficial cargada tras activar el iframe medido, `enablejsapi=1` y `origin`. Solo PLAYING (`1`), recibido por cambio de estado o confirmado al iniciar el SDK, emite el `PLAY_VIDEO` existente con artículo/proveedor/video/módulo/posición/tratamiento. El ledger del propietario conserva una reproducción por exposición + módulo + artículo + proveedor + video; pausa, reanudación y remount no duplican.
- El SDK comparte una carga y respeta callbacks globales anteriores. Cambiar de tarjeta destruye el player propio; las promesas/callbacks tardíos quedan anulados. Error o timeout no se interpreta como play. React conserva el host, el proveedor administra su iframe.
- Carrusel nativo: una intención de flecha/rueda/teclado/touch y un cambio efectivo de tarjeta inicial al finalizar generan `CLICK_EVENT / VIDEO_WIDGET / CAROUSEL_NAVIGATION`. Índices 1-based, dirección y método `arrow`/`gesture`; tipo `video_carousel`. Se usa `scrollend` o 250 ms sin scroll tras liberar el contacto/tecla. Una tarjeta inicial tiene al menos 50 % de solapamiento horizontal. Esto describe navegación, **no certifica impresión**: sigue rigiendo 50 % descubierto y 1.000 ms para esa métrica.
- Un extremo sin movimiento, resize, ocultación/blur, scroll solo programático o cancelación sin desplazamiento no genera navegación. La intención sin movimiento expira a los 800 ms cuando ya no hay contacto. Se conserva la última posición asentada porque un listener pasivo de rueda puede ejecutarse después del movimiento del compositor. Geometría solo en límites, sin sondeo permanente.
- No hay emisor analítico, transporte, almacenamiento, cookie o ID personal nuevo. IDs editoriales públicos y label de video canónico sin query de la fuente. Los campos de video/navegación se limpian tras el evento igual que el contexto Home existente.

## Pruebas y revisión

Las pruebas unitarias cubren ledger, validación de IDs, puente de propietario, estados SDK, timeout/error/callback previo, desmontaje, scroll nativo/fallback y recursos liberados. Los E2E distinguen el **transporte SDK simulado** de la reproducción real: en la fixture, foco/buffering/pausa dan cero eventos, PLAYING repetido da uno, cambiar de tarjeta destruye el player anterior y su callback tardío no emite. Se verifica tratamiento fotográfico y tradicional, anchos 390/1440 y tres motores.

Flechas y rueda se ejecutan con scroll real en Chromium, Firefox y WebKit; un reset programático y un extremo no suman eventos. El test de touch crea un contexto Chromium móvil con `hasTouch`/`isMobile` y envía `Input.dispatchTouchEvent` mediante CDP. Comprueba `pointercancel` **antes** del primer scroll, mantiene el dedo 350 ms con cero eventos y exige uno tras soltarlo. Se repite con detección de `scrollend` deshabilitada antes de montar la aplicación. CDP no está disponible para los otros motores: esas cuatro muestras táctiles se omiten explícitamente, sin afirmar validación táctil Firefox/WebKit ni dispositivo físico.

La revisión independiente identificó dos P2, reproducidos RED→GREEN antes de aprobar la corrección: (1) `pointercancel` nativo borraba el gesto antes del primer scroll; (2) la alternativa de 250 ms contaba una pausa mientras el dedo seguía tocando. La corrección distingue toma de control del puntero y liberación física mediante `touchend`/`touchcancel`. La revisión final no encontró otros defectos accionables en ese alcance y comprobó ambos gestos reales; no ejecutó los gates generales ni juzgó el Goal completo.

Se ejecutan lint, TypeScript, suite completa y build de producción en Node 24. La regresión general incluye Home/control, anuncios, filtros, navegación a categoría/artículo, lectura y login. **154 suites/737 tests/15 snapshots**, lint, TypeScript y build pasan. La corrida fotográfica/general tiene **117 E2E aprobados y nueve omisiones explícitas**; la tradicional, **29 aprobados y cuatro omisiones**. En ambas se usan cero reintentos. Las omisiones son touch fuera de Chromium/CDP (cuatro por corrida), lectura temporizada Firefox/WebKit (dos en la general) y tres casos que requieren un build QA deshabilitado. Los hashes de logs están en `diagnostic.json`; los informes iniciales con fallos se conservan como evidencia de diagnóstico, no como gates aprobados.

## Confirmación con YouTube real

Una comprobación independiente de las fixtures usó Chrome 155, contexto nuevo 1440×900, datos editoriales reales y API/player de YouTube sin interceptarlos. GA collect y `/api/track` se bloquearon, y las APIs de anuncios devolvieron listas vacías de fixture. Tras reproducir el primer video, el SDK confirmó PLAYING y el dataLayer registró **exactamente un** `PLAY_VIDEO` con artículo y módulo/posición V2. Se saneó el resultado quitando texto público del player y relacionados; no se capturaron credenciales ni identidad del lector.

Esta comprobación corresponde al adaptador YouTube antes de las correcciones posteriores del controlador táctil; su código SDK/reproductor no cambió. No prueba ingestión remota GA4, publicidad real, p75 de usuarios ni reproducción de todos los videos/proveedores.

## Coste y límites de aceptación

El inventario Webpack ahora incluye `cachedModules` y `cachedAssets`: un build caliente anterior omitía módulos cacheados, por lo que su inventario vacío no bastaba para demostrar ausencia de librerías. Se corrigió la afirmación en la evidencia histórica de arranque; su tabla de bytes iniciales y la prueba de carga diferida siguen siendo válidas. El grafo completo actual conserva las librerías de formularios en chunks diferidos y confirma cero pertenencia a las entradas iniciales; no son código muerto.

La unión de entradas `main-app`, layout, template y página mide **1.512.371 bytes / 28 assets JS** en control y **1.477.871 / 25** en V2. Frente a `35838c1`, son +1.363 y +4.978 bytes respectivamente (V2 +0,34 %). El adaptador YouTube propio queda en un chunk **diferido de 1.361 bytes**. Son archivos minificados sin compresión HTTP; no sumas de source modules ni CPU/CWV. Los tamaños físicos se contrastaron con stats.

La comprobación con proveedor real descargó, después de la activación, 993 bytes decodificados de `iframe_api` y 27.038 de `www-widgetapi.js` (28.031 en total). Excluye player UI/base.js, medios y otros recursos; no representa coste total del embed ni tráfico comprimido. No se añaden dependencias o consultas WordPress. Las mediciones y scripts permanecen diferidos; la preview sin propietario medido no carga la API adicional y produce cero `PLAY_VIDEO`.

**Pendientes:** Dailymotion necesita el Player ID propio solicitado; control mantiene reproductor/señal blur heredados sin certificación. No se retiran sus componentes/dependencias/estilos. Faltan política pública de consentimiento, mapping y validación GTM Preview/GA4 DebugView, RUM/selector A/B apagado, comparación final y muestra V2 de campo. El LCP tradicional con titular corto sigue sin aprobarse (~8 s en el diagnóstico anterior). Esta etapa no elimina más código ni cierra los criterios del Goal.

## Reproducción

Con Node 24, build y arranque local en 3212 deben habilitar `HOME_V2_PREVIEW_ENABLED=true`, `HOME_V2_PERFORMANCE_AUDIT=true`, `HOME_V2_READING_QA_CONSENT=granted` y vaciar `VERCEL`/`VERCEL_ENV`. El inventario necesita además `HOME_V2_BUNDLE_STATS=true` en build. No desplegar estos flags de QA.

Ejecutar `HOME_V2_VIDEO_E2E=true E2E_BASE_URL=http://localhost:3212 pnpm exec playwright test e2e/home-v2-video.spec.ts --retries=0`, con directorios únicos de HTML/resultados. Repetir arranque y runner con `HOME_V2_PREVIEW_TREATMENT=traditional` para el otro tratamiento. La segunda corrida no requiere modificar datos/cache ni reconstruir el render dinámico de QA. No configurar colectores reales para las pruebas locales.

Referencias primarias consultadas mediante Context7: [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference), [scrollend](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event), [Playwright CDPSession](https://playwright.dev/docs/api/class-cdpsession), [Webpack stats](https://webpack.js.org/configuration/stats/).
