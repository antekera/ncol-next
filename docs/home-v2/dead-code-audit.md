# Home V2: auditoría de código muerto

## Resultado

Se retiraron dos consultas literales huérfanas y el carrusel exclusivo de V2 reemplazado por el componente compartido; ninguna dependencia ni componente del control. La auditoría combina Knip existente con búsqueda de consumidores reales, imports dinámicos, configuración, rutas/build y usos compartidos. No se utiliza autofix ni se elimina por un hallazgo aislado.

| Archivo eliminado | Comprobación de desuso |
|---|---|
| `src/app/actions/getAllCategoriesWithSlug/query.ts` | La acción vigente obtiene datos con la consulta compartida; el literal no tenía consumidores en rutas, SEO, sitemap ni scripts |
| `src/app/actions/getAllPostsWithSlug/query.ts` | La acción vigente conserva su implementación y contrato; el literal separado no tenía referencias directas, dinámicas ni de build |
| `src/components/HomeV2/VideoStrip.tsx` | Único consumidor de producción sustituido por `VideoCarousel`; retirados su test del comportamiento reemplazado, selectores CSS exclusivos y `VIDEO_IMAGE_SIZES`, sin referencias restantes |

Las acciones y sus rutas permanecen. No se retiraron dependencias ni se cambió el lockfile. V2 y control comparten `VideoCarousel`, `VideoCard` y reproductor; V2 aporta sus datos de servidor y posición editorial sin otro feed. Se comparten configuración/consultas/taxonomías editoriales y utilidades de identidad/tamaños de imagen; no hay una segunda implementación de tracking.

## Análisis estático y candidatos preservados

```bash
npm run find-duplicate-code -- --reporter json
```

El script ejecuta Knip, no un detector general de duplicación. Último inventario: cinco archivos candidatos y 34 registros de hallazgos; exit 1 conocido, no se declara análisis limpio. Las pruebas del generador GTM usan una exportación sintética mínima, sin necesitar un backup de cuenta versionado.

| Candidato conservado | Razón para no eliminar ahora |
|---|---|
| `src/components/ui/alert-dialog.tsx` | También interviene en mocks/configuración; revisar componente y dependencia conjuntamente |
| `src/blocks/content/LeftPosts/index.tsx` | Distinguir consumidores heredados de `HomeLeftPosts` antes de retirar |
| `src/blocks/content/RightPosts/index.tsx` | Distinguir consumidores heredados de `HomeRightPosts` antes de retirar |
| `src/lib/hooks/data/useHeroPosts.ts` | Revisar reexports, mocks y selección anterior de portada |
| `src/app/opinion/publicar/[token]/metadata.ts` | Ruta dinámica sensible; ausencia de imports explícitos no demuestra desuso |

Plugins cargados desde CSS (`@tailwindcss/typography`, `tailwind-scrollbar`, `@tailwindcss/aspect-ratio`, `tailwindcss-animate`) no se retiran por un reporte estático. CSS heredado, dependencias globales y limpiezas extensas ajenas requieren trabajo separado.

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
