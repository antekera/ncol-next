# Opinión: consulta compartida, identidad y paralelismo

Base `1b447a0`, Node 24.19.0. El A/B público permanece apagado. [Datos saneados, fuentes y hashes](diagnostic.json).

## Contrato conservado

`OpinionAuthors` solicita `id` del post junto a título/URI en la consulta existente. Es la identidad pública de la publicación; el `databaseId` del autor se conserva exclusivamente para el endpoint de retratos. Los widgets de control/V2 prefieren `latestPost.id` en su marcador analítico y conservan URI para enlace y fallback compatible. No se añaden campos de autor o credenciales al dataLayer. Los enlaces al autor no representan clics de noticia.

La acción selecciona los mismos autores únicos hasta el mismo límite, en orden editorial. `Promise.all` arranca las consultas de fotos independientes sin esperar la anterior y devuelve resultados en el orden seleccionado. Permanecen el fallback de avatar ante HTTP/error/red/configuración ausente y el `cache: no-store` existente. No cambian endpoint, secreto, SWR, cantidad de publicaciones solicitadas ni frescura; no se añaden dependencias, consultas por tarjeta o transportes analíticos.

## Pruebas

Antes del cambio, la prueba de la acción falla por segunda foto aún no iniciada y por ausencia de ID. Las dos pruebas de widgets fallan al recibir una respuesta con ID y medir URI. Tras el cambio pasan siete casos focalizados: concurrencia con respuestas retenidas/resueltas en orden inverso, unicidad/límite/orden, fallos de fotos/configuración vacía, ID real en ambas presentaciones y compatibilidad URI/default/skeleton.

Pasan 159 suites, 770 pruebas y 15 snapshots; lint, TypeScript y build de producción terminan con exit 0. Lint detectó inicialmente una inversión de array incrustada en un bucle del test; se separó la operación y el gate final pasa. La revisión React conserva hooks, claves, fronteras cliente y markup; solo cambia la lectura del ID. No es una revisión final de toda la rama.

La matriz Playwright termina sin reintentos con 46 casos aprobados y cinco omisiones explícitas, Chromium/Firefox/WebKit, 390/1440 px. Opinión se prueba en **ambas variantes**: una sola consulta de feed, una vista de portada, impresiones tras exposición real, enlace de autor sin clic editorial, noticia con ID público/módulo/posición y «Ver más». También pasan las regresiones existentes de YouTube del control, filtros/clics y primera/segunda noticia entre pestañas. Se omiten tres casos que exigen otro build con QA apagado y dos casos de lectura temporizada fuera de Chromium. Colectores bloqueados y feeds publicitarios vacíos: no demuestra ingestión GA4, ingresos ni rendimiento publicitario real.

Knip conserva los cinco candidatos y 34 registros ya clasificados, exit 1 por hallazgos conocidos. No se elimina archivo, estilo, dependencia o función del control/internas en este cambio.

## Diagnóstico real y límites

El script local usó la consulta antes/después y los endpoints existentes sin registrar credenciales, URLs, nombres o IDs de autor. No invoca la acción Next: la concurrencia de esta se verifica mediante unitarias. Ambas respuestas GraphQL son HTTP 200 con ocho posts, un autor seleccionado y la misma firma de selección/orden; una consulta GraphQL y una foto en cada caso. La nueva respuesta añade el ID de post disponible: 3.541 → 3.549 bytes decodificados.

Las muestras totales son 994,2 y 1.015,0 ms. Son ejecuciones únicas sin control equivalente de red/caché; **no se infiere mejora ni regresión de latencia**. Con un solo autor no hay paralelismo real que cuantificar. No son Lighthouse, RUM ni percentiles. Este build no captura nuevo inventario de bundles ni una comparación final de portadas.

## Continuación

Se conserva la limitación de IDs de ranking basados en URI y la validación remota de parámetros GA4; esta mejora no las resuelve. Consentimiento/cohortes/caché pública, GTM Preview/DebugView, Dailymotion, rendimiento final y entrega siguen pendientes. El Goal continúa activo.

Referencia de esquema: [WPGraphQL, posts y páginas](https://github.com/wp-graphql/wp-graphql/blob/main/plugins/wp-graphql/docs/posts-and-pages.md), consultada mediante Context7; el smoke real confirma compatibilidad de la selección GraphQL actual.
