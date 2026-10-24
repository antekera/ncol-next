# Home V2: auditoría de código muerto

## Resultado

Se retiraron dos consultas literales huérfanas y el carrusel exclusivo de V2 reemplazado por el componente compartido; ninguna dependencia ni componente del control. La auditoría combina Knip existente con búsqueda de consumidores reales, imports dinámicos, configuración, rutas/build y usos compartidos. No se utiliza autofix ni se elimina por un hallazgo aislado.

| Archivo eliminado | Comprobación de desuso |
|---|---|
| `src/app/actions/getAllCategoriesWithSlug/query.ts` | La acción vigente obtiene datos con la consulta compartida; el literal no tenía consumidores en rutas, SEO, sitemap ni scripts |
| `src/app/actions/getAllPostsWithSlug/query.ts` | La acción vigente conserva su implementación y contrato; el literal separado no tenía referencias directas, dinámicas ni de build |
| `src/components/HomeV2/VideoStrip.tsx` | Único consumidor de producción sustituido por `VideoCarousel`; retirados su test del comportamiento reemplazado, selectores CSS exclusivos y `VIDEO_IMAGE_SIZES`, sin referencias restantes |

Las acciones y sus rutas permanecen. No se retiraron dependencias ni se cambió el lockfile. V2 y control comparten `VideoCarousel`, `VideoCard` y reproductor; V2 aporta sus datos de servidor y posición editorial sin otro feed. Se comparten configuración/consultas/taxonomías editoriales y utilidades de identidad/tamaños de imagen; no hay una segunda implementación de tracking.

Separación del snapshot editorial (23/10/2026): se retira el argumento de día de la clave persistente y el filtrado previo a guardarlo; la misma política se aplica al leer. Se conserva el cargador filtrado existente como contrato compatible y se añade un cargador de candidatos usado por el caché, sin duplicar parser, consultas ni reglas. Ningún archivo o dependencia eliminado; Home heredado, internas y transportes regionales preservados. La prueba de Next real contrasta el fallo anterior con reutilización tras medianoche/reinicio durante caída CMS; también se verifican invalidación por publicación y recuperación de respuestas parciales.

## Análisis estático y candidatos preservados

Contrato de lanzamiento directo (23/10/2026): se retiran los campos de asignación experimental del tipo, productores, claves de deduplicación, sanitizador y generador GTM. Se conserva su limpieza mediante valores nulos sin evento para evitar residuos en el modelo GTM; no se emiten ni restauran orígenes A/B. El formato de lectura se versiona sin reutilizar snapshots experimentales. No hay archivos/dependencias eliminados ni cambios a slots, rutas implícitas o componentes exclusivos del Home anterior. Las pruebas de compatibilidad del transporte, ciclo de vista y sesión siguen siendo obligatorias.

La reparación de la reserva de Videos mantiene el carrusel compartido y su carga diferida. Se sustituyen las clases de proporción inefectivas de ese marco, sin borrar estilos globales que puedan tener otros consumidores. No se crea otro carrusel ni se retiran proveedores o componentes del Home anterior; ambos montajes participan en las pruebas de geometría y reproducción.

```bash
npm run find-duplicate-code -- --reporter json
```

El script ejecuta Knip, no un detector general de duplicación. Último inventario: seis archivos candidatos y 32 registros de hallazgos; exit 1 conocido, no se declara análisis limpio. Las pruebas del generador GTM usan una exportación sintética mínima, sin necesitar un backup de cuenta versionado.

Recuperación SQL del 24/10: el lector autenticado es una ruta dinámica de Next y consumidor explícito del getter compartido; el flag durable lo protege, por lo que no se considera código muerto aunque esté apagado. Comparte la misma entrada de datos y política editorial, sin implementación paralela ni nuevas dependencias. No se eliminan archivos. Knip conserva seis candidatos/32 registros y no señala los archivos nuevos; 1.055 unitarias, builds público/rollback y 24 E2E verifican esta pasada, preservando control, internas, publicidad y dataLayer.

| Candidato conservado | Razón para no eliminar ahora |
|---|---|
| `src/lib/db/index.ts` | Cliente Postgres ajeno a este cambio; revisar historia/consumidores y configuración de suscripciones por separado |
| `src/components/ui/alert-dialog.tsx` | También interviene en mocks/configuración; revisar componente y dependencia conjuntamente |
| `src/blocks/content/LeftPosts/index.tsx` | Distinguir consumidores heredados de `HomeLeftPosts` antes de retirar |
| `src/blocks/content/RightPosts/index.tsx` | Distinguir consumidores heredados de `HomeRightPosts` antes de retirar |
| `src/lib/hooks/data/useHeroPosts.ts` | Revisar reexports, mocks y selección anterior de portada |
| `src/app/opinion/publicar/[token]/metadata.ts` | Ruta dinámica sensible; ausencia de imports explícitos no demuestra desuso |

Plugins cargados desde CSS (`@tailwindcss/typography`, `tailwind-scrollbar`, `@tailwindcss/aspect-ratio`, `tailwindcss-animate`) no se retiran por un reporte estático. CSS heredado, dependencias globales y limpiezas extensas ajenas requieren trabajo separado.

La integración durable retira únicamente el alias de tipo `HomeVariant`, sin consumidores en aplicación, scripts, Storybook o configuración (`rg` y tipos). Es borrado de un tipo sin código emitido; no se atribuye ahorro de bundle. El esquema/cliente nuevos tienen consumidores explícitos solo en el perfil optativo; el último Knip no registra hallazgos nuevos para esos módulos. No se retiran archivos ni dependencias adicionales. La base/control/internas permanecen protegidos; las comprobaciones de build y navegación se documentan con su flag correspondiente.

El perfil posterior de HTML reutiliza las ediciones calculadas en servidor para la caché y el mismo componente: no añade otra composición completa ni una consulta por módulo/visitante. No elimina componentes, estilos ni dependencias adicionales. Se conserva el circuito anterior cuando el perfil durable está apagado y se prueban build/metadata/caché del control, internas y publicidad; la compatibilidad de configuración del framework se documenta aparte.

## Compatibilidad protegida

- `PostHero`, `HomeLeftPosts`, `HomeRightPosts`, hooks y estilos exclusivos del Home actual: respaldo de rollback hasta estabilizar el lanzamiento directo.
- `GAEvent`, `GAPageView`, constantes, dataLayer y GTM existentes: consumidores y transporte vigentes.
- Tarjetas, imágenes, rankings, opinión, categorías y artículos: comportamiento/defaults compartidos conservados y pruebas de regresión.
- Slots, IDs, fallback, configuración remota y sticky publicitarios: usos dinámicos e ingresos; ningún borrado por falta de referencia estática.
- Rutas Next implícitas/dinámicas, metadata, feeds/sitemap, proxy, instrumentación, procesos de build y mantenimiento: revisar entradas efectivas.
- Login/formularios y SDKs todavía usados en chunks diferidos: diferirlos no los convierte en código muerto. El análisis Webpack incluye módulos/assets cacheados para no concluir ausencia por un inventario incompleto.

## Pruebas realizadas

Tras la implementación: lint, tipos, build, 161 suites/794 unitarias/15 snapshots. La matriz anterior a la última protección del hook de autores suma 148 E2E aprobados y dos omisiones cronometradas explícitas en tres motores, para control/V2/internas; el guard posterior se prueba con WebKit móvil, API real y 401 simulado en ambas portadas. No se reetiqueta esa matriz previa como una nueva ejecución.

La protección del hook rechaza errores HTTP/payloads no-lista sin quitar autorización. No elimina código adicional. La limpieza de adjuntos del PR afecta documentación y la fixture CLI; se verifica por separado sin modificar runtime.

La consolidación posterior del video pasa 161 suites/797 unitarias/15 snapshots, lint, tipos y build. Pasan además 62 E2E sin reintentos en tres motores para V2/control, opinión y dimensiones de imágenes; cuatro casos táctiles se omiten expresamente en motores sin CDP. Se comprueban carga diferida, feeds no duplicados y contexto de eventos. No se añaden dependencias ni adjuntos de diagnóstico al PR.

## Después del lanzamiento

Decisión del 18/10/2026: se cancela el A/B y se prepara la sustitución directa por V2. Retirar el Home heredado solo después de estabilizar el lanzamiento y revisar la necesidad de rollback:

1. Trazar consumidores de cada componente/hook/estilo exclusivo del control y repetir búsqueda de imports dinámicos/configuración.
2. Mantener componentes compartidos con categorías/artículos y medición/publicidad; retirar únicamente las piezas ya sustituidas.
3. Repetir Knip y revisar manualmente CSS, dependencias y scripts; registrar pruebas de cada eliminación, sin autofix global.
4. Probar control/rollback cuando corresponda, artículos/categorías, servicios, consentimiento, GTM y anuncios antes de retirar fallbacks.
5. Llevar limpiezas extensas no relacionadas a un PR independiente. El lanzamiento directo no autoriza a borrar todo lo señalado.

No habrá experimento público. Los candidatos anteriores continúan preservados hasta comprobar sus condiciones y sus consumidores compartidos; este cambio de plan no elimina código adicional.

Corrección de vigencia editorial (18/10/2026): se retiran el filtro de publicación diaria, su validación, el parámetro `publicationDay` y el filtro SQL por URI introducidos por la interpretación incorrecta. Se conserva la regla de categorías/marca de apertura y se filtran fechas explícitas del título. No se eliminan archivos ni dependencias; control y funcionalidades compartidas quedan preservados.


Optimización del 19/10/2026: el cuerpo del carrusel y su skeleton se extraen para permitir carga diferida, conservando exports, consumidores y comportamiento compartido; no se mantienen implementaciones duplicadas ni se retiran dependencias. Las tarjetas siguen sirviendo control/V2 e internas. 883 unitarias, build/tipos/lint, 20 comprobaciones de caché real y 71 E2E verifican esta pasada; la limpieza heredada posterior al lanzamiento continúa separada.

Compatibilidad de lanzamiento (23/10/2026): el Home anterior se extrae a `src/components/LegacyHome/index.tsx`, con cuerpo de renderizado idéntico al anterior `page.tsx`. No se retira ningún componente, estilo ni dependencia heredada. `HomeEntry` es el fallback de herramientas; `next.config.mjs` selecciona esa entrada o `HomeV2/PublicHome.tsx` para el build. Son referencias por configuración que deben preservarse aunque un analizador no siga la selección. Su exclusión del bundle inactivo no equivale a borrar el código de rollback.

La repetición local de Knip tras esta extracción devuelve seis archivos candidatos y 33 registros de incidencias (salida 1, no aprobación de borrado). Incluye `src/app/opinion/publicar/[token]/metadata.ts`; las referencias por configuración, rutas dinámicas, herramientas y los candidatos heredados requieren revisión separada. No se elimina ninguno en este cambio. Las alertas Home V2 son exports/tipos ya preservados; las nuevas entradas de servidor no se consideran código muerto.

Limpieza directa de Home V2 (23/10/2026): se retira la condición obsoleta `HOME_V2_EXPERIMENT_ENABLED` del filtro regional, reemplazada por el flag de lanzamiento público. Búsqueda en `src`, scripts, configuración y ejemplo de entorno confirma que solo queda su mención en una regresión negativa. Pruebas de preview/público/deshabilitado y selección regional en producción local verifican el reemplazo; sin archivos ni dependencias retirados.

Consolidación regional (23/10/2026): el cuerpo de carga de la Action pasa a `getHomeV2RegionData.ts` para compartirlo con el GET público; no se mantienen dos implementaciones de consultas/composición. La Action conserva su contrato y consumidores de preview, protegidos por las cuatro regresiones existentes antes y después de la extracción. No se eliminan archivos ni dependencias. Las pruebas adicionales de transporte, 961 unitarias/15 snapshots, lint/tipos/build y 18 E2E de lanzamiento/rollback verifican compatibilidad; no autorizan eliminar componentes del Home anterior.

Dependencia editorial redundante (23/10/2026): el cargador regional deja de cargar toda la portada para validar categorías y reutiliza el getter de taxonomía ya cacheada. La carga completa sigue vigente en Home y no se elimina; tampoco cambian sus claves, tags ni plazos. La composición compartida conserva orden/deduplicación, y las pruebas mantienen artículos antiguos sin fecha vencida y el lead que también esté destacado. Next real prueba dos consultas antes/una después en el escenario editorial vencido y región fría; 964 unitarias/15 snapshots, lint/tipos/build y 18 E2E verifican la separación. Cero archivos o dependencias retirados.

Corrección del lector (23/10/2026): se retira de `DailyBoundary` la rama de refresh único, espera y recarga manual que quedaba bloqueada con los mismos props cacheados. Sus consumidores son Home V2 y el fixture/test actualizados; se reemplaza por reloj/selector local y se reutiliza el parser extraído, sin reglas paralelas. No se elimina código del Home anterior ni dependencias. Tests de caché/browser antes rojos y ahora verdes, instancia estable de anuncios, posiciones y tarjeta sin precarga futura verifican el reemplazo. La coordinación global de HTML sigue pendiente y los componentes de rollback se conservan.
