# Imagen crítica V2: optimización existente y descarga única

Estado: corrección funcional y de recursos verificada; **comparación Lighthouse posterior pendiente**. El A/B público sigue apagado. [Diagnóstico previo de 40 corridas](../responsive-original/verification.md), [fuentes y prueba actual](diagnostic.json).

## Cambio limitado

La imagen crítica de V2 puede usar el optimizador Next ya configurado, sin añadir servicios o dependencias. `SafeImage` incorpora `optimizeCdn`, apagado por defecto; control, internas, imágenes heredadas y el fallback local conservan su comportamiento anterior. Solo `HomeImage` crítico del host HTTPS exacto `cdn.noticiascol.com` activa la opción. Las otras tarjetas conservan derivados WordPress y carga por proximidad. No se cambia `next.config`, formato global, caché/TTL, fuente editorial, dimensiones, estilos ni publicidad.

`getImageProps` genera los mismos candidatos optimizados para `<source>` y el preload responsive; `SafeImage` usa la misma entrada/configuración. Se evita precargar el JPEG original además del candidato. Los `sizes` del hero reflejan el grid real: 549 px con el contenedor máximo, cálculo del grid en portátil, espacio del sidebar en tablet y padding móvil. No se disminuye el tamaño visible para modificar LCP.

La prueba de navegador descubrió además un 308: el loader Next con `trailingSlash` genera `/_next/image/`, mientras el proxy retiraba la barra. El handler Next acepta esa ruta. La excepción del proxy se limita a ese endpoint exacto; dominios, documentos, APIs y otros assets conservan su política. Pruebas específicas verifican paso directo y canonicalización de apex a `www` conservando la ruta de imagen. Se conservan las pruebas previas de rutas y protección de origen.

## Evidencia real de recursos

21 escenarios Chromium/Firefox/WebKit, siete combinaciones viewport/DPR, verifican respuesta HTTP 200/WebP, una sola petición optimizada, cero petición adicional del original, preload/candidatos iguales y ancho declarado/renderizado con diferencia menor de 1 px. Se usan la imagen editorial real y el endpoint Next real; no se simula respuesta de imagen. El input conserva la misma firma SHA que el original del diagnóstico previo.

Muestras Chromium de la misma imagen:

| Viewport / DPR | Ancho CSS real y declarado | Candidato solicitado | Respuesta WebP |
| --- | ---: | ---: | ---: |
| 390 / 1 | 358 px | 371 px | 11.226 bytes |
| 390 / 2 | 358 px | 728 px | 28.572 bytes |
| 390 / 3 | 358 px | 1080 px | 43.936 bytes |
| 412 / 1,75 | 380 px | 728 px | **28.572 bytes** |
| 820 / 2 | 540 px | 1080 px | 43.936 bytes |
| 1100 / 2 | 484,70 px | 970 px | 39.492 bytes |
| 1440 / 2 | 549 px | 1134 px | 45.902 bytes |

En 412/DPR 1,75, el cuerpo pasa de 571.161 bytes JPEG del diagnóstico a 28.572 bytes WebP, aproximadamente 95 % menor. Es una comparación del recurso de la misma imagen, **no una mejora LCP ni p75**. Los bytes proceden de tamaño de recurso/Content-Length, no incluyen todos los headers/transportes de página. La caché de transformación local puede estar caliente; falta medir su coste frío y el despliegue AWS/OpenNext.

Se inspeccionaron [móvil DPR 3](editorial-image-390-dpr-3.png) y [escritorio DPR 2](editorial-image-1440-dpr-2.png). Son capturas tempranas para revisar la imagen crítica; las miniaturas/feeds vecinos aún pueden estar cargando. No sustituyen la aceptación visual final de todos los módulos ni una comparación de anuncios.

## Pruebas y compatibilidad

RED inicial: dos casos fallan porque la imagen crítica ofrece URLs originales y el opt-in de `SafeImage` no existe. GREEN: se conservan carga diferida nativa, fallback/error/cambio regional y default heredado. RED adicional de proxy: dos casos detectan el 308; GREEN: 69 pruebas focalizadas pasan. No se modifica el selector de imagen del control ni se actualizan snapshots para aceptar cambios.

Gates finales: **159 suites/775 pruebas/15 snapshots**, lint, TypeScript y build con exit 0. La matriz final sin reintentos suma **57 E2E aprobados y tres omisiones explícitas**: los casos de build normal con QA apagado requieren otro build. Incluye los 21 escenarios de imagen, 18 analíticos y 18 de portada/control/categoría/artículo/filtro/video/fallback. Los colectores están bloqueados y la prueba específica de recurso usa catálogo publicitario vacío; no representa rendimiento, ingresos ni consentimiento real.

Se conservan los dos intentos E2E fallidos como diagnóstico: primero la expectativa no admitía la barra generada por Next; después la traza confirmó el 308 real sin Content-Type de imagen. La prueba final exige una única respuesta 200; no se ocultan redirects contando solo el último cuerpo.

Inventario Webpack completo con caché: control 29 assets/1.525.408 bytes compilados; V2 26/1.486.343. Frente a `854614f`, +270/+480 bytes respectivamente, incluyendo también la mejora de Opinión (sin inventario intermedio). Tamaños físicos verificados, sin compresión HTTP; no se atribuyen a CPU o CWV. Knip conserva cinco candidatos/34 registros, exit 1 conocido. No se elimina archivo, estilo o dependencia.

## Siguiente validación

Repetir comparación equivalente control/foto y tradicional con el código corregido, manteniendo anuncios y scripts reales. Conservar por separado mejoras/regresiones, imágenes, caché fría de navegador frente a transformación y candidaturas LCP. El caso tradicional de titular corto/creatividad tardía y los demás criterios del Goal siguen pendientes. No se aprueba el rendimiento global a partir de esta reducción de bytes.

API consultada con Context7 y contrastada con Next instalado: [getImageProps y picture](https://nextjs.org/docs/app/api-reference/components/image#getimageprops), [resource hints ReactDOM](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#resource-hints).
