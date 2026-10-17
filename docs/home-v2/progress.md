# Estado de ejecución de Home V2

17 de octubre de 2026. Goal activo en `feat/home-v2-plan`; experimento sin activar, Home público conservado y preview local opt-in.

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
