# Home V2: auditoría y eliminación segura de código muerto

Estado: inventario estático contrastado y primera limpieza segura: **dos consultas literales huérfanas eliminadas; ninguna dependencia retirada**. Se preservan componentes/estilos del control y compartidos. La revisión global de dependencias, CSS heredado y lógica ajena a Home V2 tiene candidatos pendientes para trabajo separado. Ver [Goal](GOAL.md) y fases 1, 4, 9 y 11 del plan.

## Herramienta y alcance inicial

Se utilizó el Knip ya instalado, mediante `npm run find-duplicate-code -- --reporter json`. El nombre del script no significa que detecte todas las duplicaciones de código: Knip analiza referencias/exports/dependencias; la duplicación de lógica requiere revisión adicional.

Configuración existente `knip.ts`: `entry: ['src/app/layout.tsx']`, `project: ['src/**/*.{ts,tsx}']`. Revisar los plugins y entradas efectivas de Next, Storybook, Jest, Playwright, scripts y build antes de decidir cualquier borrado. Los patrones actuales no acreditan cobertura de CSS, scripts externos ni uso dinámico por configuración.

Runtime de esta pasada: Node `v25.9.0`, Next instalado `16.4.0`, Knip `5.88.1`. El proyecto exige Node 24; repetir gates de implementación y mediciones comparativas con Node 24. Esta pasada sirve para inventario, no acredita compatibilidad del build con el runtime requerido.

Evidencia cruda: [JSON inicial](evidence/knip-initial.json) y [stderr](evidence/knip-initial.stderr.txt). La ejecución finaliza con código 1 por hallazgos; no se interpreta como auditoría aprobada. Stderr contiene avisos de deprecación de Sentry, que se registran sin mezclar una migración ajena a este trabajo.

## Candidatos informados, no eliminaciones aprobadas

| Archivo señalado                                    | Clasificación inicial                              | Verificación requerida                                                                                                |
| --------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/alert-dialog.tsx`                | Candidato de componente sin referencias detectadas | Buscar imports directos, barrels, configuración, stories y consumo indirecto; verificar dependencia Radix en conjunto |
| `src/app/actions/getAllCategoriesWithSlug/query.ts` | Candidato, alto cuidado por taxonomías/SEO         | Revisar generación estática, sitemap, categorías y scripts de mantenimiento                                           |
| `src/app/actions/getAllPostsWithSlug/query.ts`      | Candidato, alto cuidado por rutas dinámicas        | Revisar `generateStaticParams`, generación SEO/build y consumo por configuración                                      |
| `src/blocks/content/LeftPosts/index.tsx`            | Candidato heredado                                 | Distinguir `LeftPosts` de `HomeLeftPosts`; buscar imports dinámicos, stories y uso del control                        |
| `src/blocks/content/RightPosts/index.tsx`           | Candidato heredado                                 | Distinguir `RightPosts` de `HomeRightPosts`; comprobar control y categorías                                           |
| `src/lib/hooks/data/useHeroPosts.ts`                | Candidato de hook anterior                         | Revisar reexports, mocks y selección de portada; conservar hasta verificar                                            |
| `src/app/opinion/publicar/[token]/metadata.ts`      | Candidato en ruta dinámica sensible                | Revisar import de metadata y ruta por token; no eliminar por heurística                                               |

El reporte también contiene dependencias/exports/tipos candidatos, dependencias no declaradas e imports no resueltos. Evaluarlos individualmente; un import no resuelto no demuestra que una dependencia sea innecesaria. No borrar en bloque los resultados de `package.json`.

Contraste manual inicial: `src/styles/index.css:1–4` carga `@tailwindcss/typography`, `tailwind-scrollbar`, `@tailwindcss/aspect-ratio` y `tailwindcss-animate` mediante `@plugin`. Knip los lista como candidatos, pero **tienen uso por configuración CSS y deben preservarse**. `alert-dialog.tsx` también está referenciado en un mock global de `jest.setup.ts` y en configuración de cobertura; cualquier eliminación necesita revisar esos consumidores además de producción.

## Código preservado por compatibilidad

| Conjunto                                                                                           | Razón y evidencia                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home actual: `PostHero`, `HomeLeftPosts`, `HomeRightPosts`, hooks, estilos y utilidades asociados  | Grupo de control requerido durante todo el A/B; imports presentes en `src/app/page.tsx`                                                                              |
| `ga.ts`, `GAPageView`, `GAEvent`, `GA_EVENTS`, `DeferredGoogleTagManager`                          | Tracking obligatorio; hay llamadas reales y reexports. Knip señala el reexport de `GAPageView` aunque existen consumidores: revisar grafo, no borrar automáticamente |
| `Sidebar`, `CategoryArticle`, `LazyImage`, `CoverImage`, `SafeImage`, rankings y hooks compartidos | Uso compartido con páginas internas; cobertura de regresión obligatoria                                                                                              |
| `AdSenseBanner`, `NcolAdSlot`, `StickyHeaderAd`, `ads.ts`, fallback/configuración publicitaria     | Carga dinámica/remota y slots; sin cambios a identificadores                                                                                                         |
| `src/app/**`, rutas dinámicas, metadata, feeds/sitemaps, `proxy.ts`, instrumentación               | Entradas implícitas del framework, SSR y build; no dependen de imports explícitos en todos los casos                                                                 |
| Estilos, plugins Tailwind, ESLint, Storybook, Sentry, scripts y workflows                          | Dependencias/configuración pueden resolverse por nombre. El reporte no autoriza su retirada                                                                          |

## Método de verificación por candidato

1. Guardar archivo/export/dependencia, motivo del hallazgo, consumidores, riesgo, evidencia y decisión en este informe.
2. Buscar símbolos, paths, barrels, alias, strings de `import()`, `require`, configuración, CSS, tests/stories, scripts y CI con `rg`. Revisar rutas Next y cargadores por configuración, incluidos consumidores fuera de `src/`.
3. Leer implementaciones equivalentes y llamadas reales. Para estilos, inspeccionar clases dinámicas/variantes y uso móvil/escritorio en **ambos grupos**; una cobertura de una sola ruta no demuestra desuso.
4. Verificar dependencias por uso en producción, build, pruebas, mantenimiento y configuración. Si un reemplazo compartido afecta Home/categorías, escribir regresión antes de consolidar.
5. Si persiste duda, preservar y documentar. Si está demostrado muerto y relacionado con V2, eliminar en cambio pequeño revisable junto a su prueba/evidencia; actualizar lockfile si corresponde.
6. Ejecutar lint, tipos, unitarias, build y E2E del Home control/V2, artículo, categorías, sidebar y servicios; comparar publicidad y eventos. No rebajar coverage, ignorar hallazgos indiscriminadamente ni usar `knip --fix`.

## Dos grupos de limpieza

### Segura durante desarrollo

Solo candidatos inequívocamente muertos tras completar las verificaciones anteriores. Cada eliminación debe adjuntar evidencia de no uso y resultado de pruebas apropiadas.

| Archivo eliminado | Dependencia retirada | Duplicación consolidada | Evidencia y pruebas                                              |
| ----------------- | -------------------- | ----------------------- | ---------------------------------------------------------------- |
| `src/app/actions/getAllCategoriesWithSlug/query.ts` | Ninguna | Ninguna | Literal GraphQL sin consumidor; carpeta solo contenía este archivo. Búsqueda de imports, reexports, dinámicos/configuración y entradas de Next negativa. |
| `src/app/actions/getAllPostsWithSlug/query.ts` | Ninguna | Ninguna | Mismo contraste; no hay `page.tsx`, `route.ts`, Server Action ni carga por nombre de este archivo. |
| Ninguno en la corrección publicitaria | Ninguna | Los dos efectos de selección/resize de imagen en `NcolAdSlotStickyBottomInner` pasan a usar `useResponsiveAdImage`, ya utilizado por slots normales | Contrato contrastado: misma fuente por breakpoint y limpieza del listener; pruebas RED→GREEN de resize/error/contador único, 670 tests y 33 E2E en los tres motores. Se conserva publicidad compartida, sin eliminar componentes del control. |

### Después del experimento

- Componentes/estilos exclusivos del Home actual: solo si V2 resulta elegido y se autoriza retirar el control.
- Selector/asignación A/B y contexto experimental: retirar o migrar después de preservar la capacidad de interpretar datos históricos.
- Si gana control, auditar los componentes exclusivos de V2 antes de retirarlos; no borrar lo compartido con categorías.
- Revisar hooks y consultas heredadas cuando sus consumidores hayan sido retirados realmente; repetir análisis completo y regresiones.
- Trabajo amplio de dependencias, lint/build o componentes ajenos: preparar alcance separado con motivo, riesgo y pruebas; no incorporarlo por arrastre al PR de Home V2.

## Pruebas realizadas y pendientes

Limpieza de configuración verificada durante la preparación: `.prettierrc.json` apuntaba a un `tailwind.config.js` inexistente, provocando fallo de formateo. Se sustituyó por `tailwindStylesheet: ./src/styles/index.css`, el punto de entrada Tailwind v4 real; el formateador volvió a ejecutarse correctamente sin cambiar el stylesheet. Se excluyeron del lint `.kilo/worktrees/` (copia local ajena sin archivos versionados) y `.superpowers/` (evidencia temporal), igual que el resto de worktrees ya excluidos. No se eliminaron esas carpetas ni se desactivaron reglas sobre `src/`.

- Ejecutada: `npx jest src/lib/utils/__tests__/ga.test.ts --runInBand --coverage=false`: **4 pruebas pasan**. Acredita la utilidad actual, no la futura instrumentación V2 ni la inocuidad de eliminaciones no realizadas.
- Ejecutado: Knip en lectura; reporta candidatos y problemas pendientes. No demuestra ausencia de código muerto ni de regresiones.
- Pendiente antes de limpiar: revisión completa de cada candidato y entradas dinámicas; análisis de CSS, duplicaciones y lógica inaccesible.
- Pendiente después de cada limpieza: lint, tipos, suite unitaria requerida, build y pruebas E2E/visuales de ambas portadas, categorías y páginas internas.

Documentación de Knip consultada mediante Context7: [Next plugin](https://knip.dev/reference/plugins/next), [tratamiento de hallazgos e imports dinámicos](https://knip.dev/guides/handling-issues), [modo producción](https://knip.dev/features/production-mode). No usar modo producción como prueba única: omite herramientas/test/stories necesarios para el proyecto.

## Revisión contrastada y limpieza del 17 de octubre

Se repitió Knip con **Node 24.19.0** antes/después. Los candidatos de archivo pasan de siete a cinco exactamente por las dos consultas eliminadas. [Resumen revisado](evidence/dead-code-reviewed.json). Knip sigue saliendo con código 1 por hallazgos preservados; no se presenta como resultado limpio.

Se comprobó el uso real: `generateStaticParams` de categorías deriva paths de `MENU`/`MENU_B`; el generador SEO conserva consultas propias y los clientes API permanecen. No hay importación dinámica, glob ni carga por nombre de esas dos consultas. Sus exports son solo strings y no generan una ruta ni un efecto al importar. No se espera ahorro de bundle: ya estaban fuera del grafo de producción.

| Candidato preservado | Decisión y evidencia |
| --- | --- |
| `LeftPosts`, `RightPosts`, `useHeroPosts` | Heredados sin referencias detectadas, pero se conservan durante el A/B para no mezclar retirada de implementaciones de portada. El control real sigue usando `HomeLeftPosts`, `HomeRightPosts`, `PostHero` y sus hooks. Revalidar al retirar definitivamente el grupo perdedor. |
| `ui/alert-dialog.tsx` y Radix relacionado | Hay mock global/configuración de cobertura. Retirada de primitivas/dependencias ajena al rediseño: trabajo separado con sus consumidores de test y evaluación de toda la UI. |
| `opinion/publicar/[token]/metadata.ts` | Objeto duplicado sin consumidor; la ruta declara su propia metadata `noindex`. Limpieza de Opinión ajena a Home V2, documentada para trabajo separado; no tocar tokens/rutas por arrastre. |
| Plugins CSS señalados por Knip | Usados con `@plugin` en el stylesheet: falsos positivos confirmados; se preservan los cuatro. |
| `react-sticky-box`, carrusel y hooks actuales | El sidebar de páginas internas y control aún los usa. El carrusel nuevo nativo no autoriza retirar dependencias compartidas. |
| SDKs/exportaciones señalados sin uso claro | No se eliminan sin confirmar build, scripts e infraestructura; quedan en el inventario Knip original para revisión separada. |

CSS: las 46 clases detectadas en `HomeV2.module.css` tienen consumidores locales/dinámicos (`hero`, `lead`, `compact`, `text`) o uso global de tema (`dark`). En el stylesheet heredado se verificaron consumidores de `scrolling-touch`, `scrolling-auto`, `mobile-centered-carousel`, `active-menu`, `bloque-adv-list`, `show-mobile`, `show-desktop`, `slides-container` y `destacador.destacado` en control, categorías, slider y `PostBody`. No se purgan estilos globales que puedan venir del HTML de WordPress ni de anuncios. No se encontró limpieza de CSS inequívoca dentro de este alcance.

Duplicaciones: no se consolidan implementaciones heredadas en este corte. V2 usa una sola tarjeta con cuatro presentaciones, encabezado compartido, `SafeImage`, limpieza de extractos y utilidades/clientes existentes. La analítica preparada sigue sin montar; sus tests no prueban tráfico real ni autorizan que Knip la elimine como experimento abandonado.

Gates tras eliminar las consultas: **140 suites/634 tests/15 snapshots, lint y build de producción pasan**. **18 E2E pasan en Chromium, Firefox y WebKit** con preview móvil/escritorio, filtros, fallback de imagen, video diferido y navegación real por control/categoría/artículo. Las pruebas de rutas públicas bloquean el envío a GA4 y a `/api/track` para no almacenar eventos de QA; la prueba de preview exige que ni siquiera intente esos envíos. La comprobación remota del A/B sigue pendiente y no se cierra el Goal por esta limpieza.

## Compatibilidad de la optimización publicitaria compartida

`c096254` divide la obtención existente en campañas directas y fallback opcional, sin retirar componentes, dependencias ni integraciones. No es una eliminación nueva de código muerto. Se preservan la consulta de configuración solo para slots vacíos, targeting, prioridad/selección aleatoria, nonce diario, IDs, conteos y temporizador del popup. Los consumidores no fijan no-fill antes de completar su propio fallback. Build/lint, 677 tests unitarios y 36 E2E del control/tradicional pasan, incluidos slots de terceros tardíos y conteo único. La limpieza posterior al A/B y los candidatos ajenos conservan las decisiones anteriores.

`f19f882` conecta la medición local al template existente y a `GAEvent`, conservando los handlers heredados. Añade atributos de colocación a apertura/columnas del control; `CategoryArticle` solo los emite cuando recibe su prop opcional Home. No retira código, dependencias ni módulos del grupo de control. Categorías y artículos mantienen navegación real en la regresión de tres motores; 690 tests unitarios, lint y build pasan. El núcleo de lectura todavía pendiente conserva sus tests y no debe confundirse con código muerto por no estar montado. La retirada pos-A/B mantiene el inventario anterior.

`b50a686` concentra geometría/clipping y el sondeo compartido en `occlusion.ts`/`visibilityChecks.ts`, consumidos por la utilidad de impresiones existente. Reutiliza readiness publicitaria y overlays Radix; añade únicamente marcadores en cuatro componentes, sin retirar handlers, estilos o integraciones. `c485def` corrige la clasificación de marcadores y el contenido en la propia sección del control. No hay nuevas eliminaciones ni dependencias. Regresión: 702 tests unitarios/15 snapshots, lint/build, 30 casos de overlays reales, 45 funcionales y validación analítica de ambos tratamientos. Los candidatos de limpieza pendientes mantienen su revisión individual; el núcleo de lectura preparado se preserva para conectar su adaptador.


## Adaptador de lectura y compatibilidad

Esta etapa no elimina más archivos ni dependencias. Se reutilizan `GAEvent`, el núcleo de lectura, el pool de visibilidad y su geometría de oclusión; no se añade SDK analítico ni librería de carrusel. `SinglePost`, `LoaderSinglePosts`, `PostHeader` y `PostBody` reciben marcadores de alcance sin sustituir vistas ni handlers heredados. Se preservan Home control, anuncios, recomendaciones y estilos. La snapshot de `PostBody` cambia únicamente por `data-reading-body`; el wrapper inicial usa `display: contents`. Las pruebas de regresión generales y la navegación real se registran en la [evidencia de destino](evidence/analytics/reading-destinations.md). El inventario y la limpieza posterior al experimento siguen vigentes.


## Rankings/servicios del control y geometría de lectura

No se retiraron más archivos, dependencias ni estilos. Se reutilizan los componentes y hooks de ranking existentes, manteniendo por defecto sus usos en páginas internas; los marcadores editoriales se solicitan en el Home. Las ventanas de siete, cinco y un día siguen intactas. El control conserva sus tarjetas y navegación. La optimización sustituye el recorrido geométrico periódico de párrafos fuera de pantalla por el mismo observer nativo con targets editoriales; no elimina funcionalidades. La corrección de orden del gesto conserva los handlers heredados y el transporte `GAEvent`. Pruebas y límites en la [verificación conjunta](evidence/analytics/control-modules-and-native-clicks.md). La limpieza posterior al experimento continúa separada.


## Diagnóstico de LCP y dependencia de idle

No se eliminan archivos, dependencias, estilos ni integraciones. El sticky reutiliza su componente actual, selección, payloads, vista/clic y controles; únicamente deja de depender de la planificación de idle. El popup permanece diferido. La fixture de titular se incorpora a la preparación local existente sin crear otro cargador de WordPress. La utilidad de diagnóstico usa la dependencia declarada `@playwright/test` y APIs nativas, sin añadir paquetes.

Los scripts de diagnóstico son entradas manuales documentadas, no candidatos de borrado por falta de imports. La corrección pasa gates generales y regresión de anuncios/control/categorías/artículos en tres motores; ver [evidencia de LCP](evidence/performance/lcp-conditional/verification.md). Los SDKs presentes en el arranque deben analizarse por su uso real antes de cualquier extracción o eliminación; no se catalogan como código muerto por su tamaño.


## Formulario cerrado y herramientas de análisis del arranque

El grafo inicial incluía formularios de acceso/registro, React Hook Form, Zod y resolvers. Son funcionalidades activas, **no código muerto**: se conservan y pasan a un import dinámico desde el provider existente. No se eliminan archivos, estilos, dependencias ni componentes del control. El aviso de carga reutiliza el marcador de oclusión; no crea tracking paralelo. El diálogo conserva registro, cierre, foco y reapertura comprobados en navegador.

`scripts/home-v2/webpack-stats-plugin.mjs` es una entrada manual desde configuración solo con `HOME_V2_BUNDLE_STATS=true`; la utilidad de LCP admite perfiles V8 opt-in. No deben borrarse por falta de referencias convencionales. Sus JSON grandes quedan ignorados; la evidencia saneada y los hashes se revisan en el [informe de arranque](evidence/performance/client-startup/verification.md). La limpieza pos-A/B y los candidatos ajenos conservan su clasificación anterior.


## Video V2 y verificación del inventario cacheado

No se retiran archivos, estilos ni dependencias en esta etapa. `VideoCard`, `VideoPlayer`, el carrusel y las utilidades compartidas del control/páginas internas se preservan: su señal heredada de blur aún requiere adaptación compatible. El nuevo reproductor V2 reutiliza el helper de URLs, el propietario de exposición y `GAEvent`; la API de YouTube se importa tras activación. `youtubePlayback.ts` es una entrada dinámica activa, no código muerto por carecer de import estático. No se añade librería de carrusel ni SDK analítico.

El análisis opcional de Webpack ahora incluye `cachedModules` y `cachedAssets`. En un build caliente, un listado que omita módulos cacheados **no demuestra ausencia de uso**. Se corrigió esa limitación en el informe histórico; los tamaños de assets y la prueba de descarga diferida siguen siendo válidos. El inventario completo actual confirma que los formularios/librerías siguen activos en chunks diferidos; no corresponde eliminarlos. [Evidencia, regresiones y revisión del adaptador](evidence/analytics/video/verification.md).

La revisión encontró dos fallos táctiles de atribución, reproducidos antes de corregir: cancelación de puntero antes del primer scroll y emisión anticipada durante una pausa sin soltar el dedo en el fallback. Las regresiones unitarias y gestos reales con/sin `scrollend` cubren las correcciones. El inventario de retirada posterior al experimento conserva su alcance; no se extiende la limpieza a integraciones activas.


## Consolidación de video y revisión estática del control

Se reubica `src/components/HomeV2/ActivatedVideo.tsx` en `src/components/VideoPlayer/ProviderVideo.tsx` y se amplía para ambas presentaciones; no es una retirada de funcionalidad ni una eliminación de código demostrado muerto. V2 y el control QA comparten adaptador/limpieza, preservando el iframe nativo por defecto de `VideoPlayer`. No se retiran dependencias ni estilos. Los reordenamientos de clases de Prettier conservan las clases existentes. Opinión añade marcadores opcionales; autor y artículo conservan enlaces distintos. La limpieza posterior al A/B mantiene su inventario.

Knip Node 24 del checkpoint vuelve a producir cinco candidatos de archivo y 34 registros de hallazgos; exit 1 significa hallazgos pendientes, no gate limpio. No aparecen nuevos archivos huérfanos del adaptador. Se conservan los cinco de la revisión anterior: `ui/alert-dialog.tsx`, `LeftPosts`, `RightPosts`, `useHeroPosts.ts` y metadata de la ruta dinámica de publicación de opinión. Las dependencias/configuraciones siguen bajo su revisión individual anterior; no se eliminan por el reporte. `HOME_V2_PREVIEW_PATH` tiene uso interno real y `HomeVariant` queda reservado a la fase A/B pendiente, sin simular uso para silenciar Knip.

[Resultado saneado y hashes](evidence/analytics/control-specialized.json), [regresión, revisión y compatibilidad](evidence/analytics/control-specialized.md). La corrección del gesto admite exclusivamente los dos nombres heredados de clic de video, manteniendo los otros eventos y el transporte existente.


## Web Vitals locales: código preservado y auditoría incremental

Se reutiliza `GAEvent`/dataLayer y el `web-vitals` compilado de Next.js. No se añade ni retira dependencia, estilo, componente del control o consulta WordPress; no se elimina código en este corte. La nueva suscripción permanece condicionada al QA local y no es un experimento abandonado. Knip mantiene cinco candidatos de archivo y 34 registros; su exit 1 indica hallazgos pendientes, no un análisis limpio. Se preservan las rutas dinámicas, integraciones y candidatos previamente clasificados. Las reglas de retirada después del A/B no cambian. [Evidencia y pruebas](evidence/analytics/vitals/verification.md).


## Configuración GTM offline

El generador de borrador es un script de mantenimiento local, con pruebas CLI y fuente de export oficial; no entra en el bundle ni reemplaza dataLayer. No elimina tags, scripts, estilos o dependencias. Knip mantiene cinco archivos candidatos/34 registros con exit 1 conocido. Las 158 suites de aplicación continúan pasando (765 pruebas/15 snapshots); no se repiten build/E2E porque no cambió runtime. El inventario protegido del control y la limpieza pos-A/B se conservan. [Diff y prueba de conservación de GTM](evidence/analytics/gtm/verification.md).

## Acción compartida de Opinión preservada

Se amplía la consulta compartida con el ID de publicación y se elimina la dependencia serial entre fotos independientes. No se elimina archivo, dependencia, estilo ni funcionalidad. Se conservan `/api/opinion/authors`, el hook SWR, caché/frescura, widgets de control/V2 y el fallback URI para consumidores anteriores. Las credenciales y el ID de autor usados en el servidor no se incorporan al payload analítico. [Pruebas y diagnóstico](evidence/analytics/opinion-data/verification.md). La lista de limpieza posterior al A/B conserva su alcance.

## Imagen crítica: opción compartida compatible

`SafeImage` conserva su default de bypass para el CDN heredado. El opt-in nuevo se usa realmente en la imagen crítica V2; no es un experimento muerto ni autoriza retirar fallbacks, derivados nativos o consumidores del control/internas. `getHomeImage` sigue seleccionando derivados para las otras tarjetas y la entrada del optimizador. La excepción del proxy cubre el endpoint generado por el framework, con pruebas de compatibilidad de dominio/rutas. No se elimina código, estilo ni dependencia. Knip mantiene cinco candidatos/34 registros; las 775 unitarias, build/lint/tipos y 57 E2E pasan. [Pruebas y límites](evidence/performance/critical-image/verification.md).

## Integridad de caché editorial

Se conserva `BaseClient.post` y su contrato de datos parciales para los consumidores compartidos. `postResult` tiene consumidores reales en módulos/taxonomías V2 y no reemplaza rutas, estilos, utilidades analíticas o anuncios. El ensayo CLI es mantenimiento de QA y usa el runtime existente sin dependencias nuevas. Knip vuelve a dar cinco archivos candidatos/34 registros, exit 1 conocido; no se borran archivos ni dependencias. Pasan 778 unitarias/15 snapshots, build/lint/tipos y 69 E2E de control, V2 e internas. [Corrección, informe y límites](evidence/performance/cache-integrity/verification.md). La limpieza posterior al A/B sigue pendiente de la decisión editorial.

## Identidad de ranking y validador compartido

Se mueve la misma función `articlePath` a un módulo puro y se conserva la reexportación de lectura. La extracción evita una dependencia de sesión en los bundles iniciales; no crea un validador duplicado ni retira interfaces usadas. Los tipos locales de ranking reutilizan la preparación compartida. No se eliminan archivos, dependencias, estilos, scripts o componentes heredados. Knip conserva cinco candidatos/34 registros (exit 1 conocido), con 786 unitarias/15 snapshots, lint/tipos/build y 64 E2E aprobadas/cinco omisiones explícitas. [Pruebas y alcance](evidence/analytics/ranking-identity/verification.md). Los candidatos protegidos y la limpieza después del A/B mantienen su clasificación.

## Tamaños de imagen y descubrimiento regional

Las declaraciones de imagen se centralizan en un módulo puro con consumidores reales. Se comparte el helper geométrico de E2E; no se añade dependencia ni se elimina código del control o de páginas internas. El orden de filtros se deriva de la configuración editorial, sin alterar consultas. El opt-in SSR se limita al lead regional en la apertura tradicional; el default de las imágenes restantes y `SafeImage` se conserva. Knip mantiene cinco candidatos/34 registros (exit 1 conocido). La limpieza posterior al A/B conserva su clasificación. [Pruebas y alcance](evidence/performance/editorial-sizes/verification.md).

## Cierre de revisión de rama

Se separa la captura síncrona de origen y la observación diferida, compartiendo el mismo coordinador. `mountBrowserReading` y la reexportación de permiso conservan el contrato de QA anterior, con consumidores de prueba reales. No se duplica el runtime ni se retiran dependencias/archivos heredados. El snapshot del probe se conserva como texto `.mjs.txt`, evidencia exacta de un diagnóstico y no nuevo entrypoint ejecutable. Knip conserva cinco candidatos/34 registros. [Revisión y verificación](evidence/review/whole-branch.md).

La corrección del fixture publicitario de CI usa configuración ficticia y mantiene el hook real; no elimina código ni dependencias ni altera el runtime. [Causa, verificación sin credenciales y límites](evidence/review/ci-fixture.md).

## Entrega de auditoría con comparación final

La [entrega de rendimiento](evidence/performance/final-6601bb1/verification.md) registra bundles/HTTP/CPU por separado y conserva las alertas, sin retirar anuncios, estilos o componentes para mejorar cifras. El código medido es `6601bb1`; la corrección posterior de CI solo afecta a su fixture. Continúan eliminadas únicamente las dos consultas huérfanas verificadas del informe inicial, sin dependencias nuevas/retiradas en este cierre. Los cinco candidatos/34 registros conocidos y la limpieza posterior al A/B conservan su clasificación; ninguna evidencia se interpreta como permiso para eliminar el control.
