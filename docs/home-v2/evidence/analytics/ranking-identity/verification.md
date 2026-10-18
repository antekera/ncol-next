# Identidad del ranking y lectura en destino

La portada reutiliza `GAEvent`/dataLayer y los mismos eventos, propiedades, consentimiento y propietarios de exposición. No hay otro transporte, SDK, cookie, identificador de lector, consulta WordPress ni cambio de base de datos para preparar las claves del ranking.

## Problema y contrato

GA4 admite 100 caracteres en el valor de este parámetro; no corresponde a las excepciones de título, referente o ubicación. El dataLayer local no recorta esos valores: el límite de aceptación pertenece a GA4. [Límite oficial de colección](https://support.google.com/analytics/answer/9267744?hl=en).

La API de ranking entrega rutas públicas, sin ID WordPress. `prepareRankingPosts` prepara `homeArticleId` dentro de los fetchers existentes, antes de que SWR publique las filas:

- Una ruta de artículo canónica de hasta 100 caracteres conserva la convención URI anterior.
- Una ruta más larga usa `uri_` seguido del SHA-256 hexadecimal completo de esa ruta: 68 caracteres. No se recorta el titular ni el enlace y no se añade una petición de metadatos por tarjeta.
- La normalización reutiliza el validador público existente: solo rutas fechadas del sitio, sin query, fragmento ni credenciales en la identidad. Los datos de navegación originales se conservan.
- Si Web Crypto falla o la ruta no identifica un artículo público válido, `homeArticleId` es `null`. La noticia/enlace siguen renderizándose, pero no se inventa una clave ni se envía una URI larga como sustituto. Las pruebas nativas verifican los navegadores soportados en un contexto seguro; no acreditan cobertura de runtimes sin esa API.

La clave `uri_…` identifica contenido público por ruta, **no es el ID global de WordPress**. Rutas alias distintas no se presuponen equivalentes. Las impresiones y clics usan la misma clave preparada; `ARTICLE_DESTINATION_OPEN` conserva esa clave en `origin_article_id` y usa el ID WordPress de la página en `article_id`. Esa unión permite resolver el origen hacia la noticia leída; la segunda noticia se deduplica con IDs WordPress. No sumar claves URI e IDs WordPress como si fueran el mismo espacio de identidad ni registrarlos como dimensiones de alta cardinalidad.

La prueba real encontró que el fragmento de artículo no solicitaba `id`: el destino usaba como fallback otra URI potencialmente larga. Se añadió `id` a esa misma consulta; variables, TTL, tags, autorización y número de operaciones permanecen iguales. Los artículos paginados ya lo solicitaban. [Contrato WPGraphQL de identificadores](https://github.com/wp-graphql/wp-graphql/blob/main/plugins/wp-graphql/docs/posts-and-pages.md).

También se corrigió el ranking V2 para navegar mediante ruta interna, conservando pathname, query y fragmento del destino público. La traza RED demostraba que una preview de localhost abría producción y abandonaba el contexto QA. El componente del control y la utilidad global de canonicalización conservan su comportamiento.

## Prueba de visibilidad y atribución

`e2e/home-v2-ranking-identity.spec.ts` utiliza artículos públicos reales. Fija únicamente el feed de ranking, con una noticia cuya URI canónica mide 104 caracteres. No fabrica páginas de destino, no publica artículos ni muta atributos de identidad. Usa el observador real y exige una impresión visible, un clic y atribución al módulo. Abre el enlace en otra pestaña, verifica el ID WordPress, abre otra noticia y comprueba que recargar no duplica aperturas ni segunda noticia. Cada ventana de ranking se solicita una sola vez.

El control móvil carga columnas sobre el ranking; la prueba vuelve a desplazarlo a la vista si esas columnas lo mueven. No relaja el 50 % visible durante un segundo continuo. Los avisos sociales se marcan como previamente descartados y los endpoints publicitarios se fijan vacíos en este ensayo funcional; no se presenta como medición de ingresos ni visibilidad publicitaria real. Collectors bloqueados durante todo el contexto.

La matriz final pasa **64 E2E**, sin reintentos ni resultados inesperados: 40 con control/apertura fotográfica y 24 del tratamiento tradicional. Incluye **18 recorridos completos de ranking** en Chromium, Firefox y WebKit, a 390/1440 px, con clave de 68 caracteres, ID WordPress correcto, un solo clic y recarga sin duplicados. Las otras pruebas verifican vistas, filtros, lectura, permiso revocado y apertura tradicional a 390/900/1440 px. [Foto/control y lectura](photographic.json), [tradicional](traditional.json).

Hay cinco omisiones explícitas: tres pruebas que requieren un build sin flags QA y dos muestras temporizadas de engagement reservadas a Chromium. No se presentan como verificadas aquí. Pasan **160 suites, 786 pruebas unitarias y 15 snapshots**, lint, TypeScript y build completo. Knip conserva cinco candidatos/34 registros con exit 1 conocido, sin borrados ni dependencias retiradas. [Hashes y límites](manifest.json).

La reproducción inicial también encontró avisos sociales no descartados y desplazamientos durante la carga del control. Se corrigieron las condiciones del ensayo sin relajar la visibilidad. Un primer intento agotó espacio al escribir trazas; se liberaron solo builds temporales propios y caché Webpack regenerable, conservando código, informes, logs, caché de imágenes y servidores del usuario. Los intentos fallidos/interrumpidos se conservan separados de la matriz final.

## Coste y compatibilidad

La primera implementación arrastraba todo el módulo de sesión de lectura para validar una ruta. Se movió la misma función pura a `articlePath.ts`, manteniendo la reexportación anterior y las pruebas de lectura. El antes/después evita 3.985 bytes compilados en cada unión inicial; la cifra no representa transferencia HTTP, CPU ni CWV.

El [inventario Webpack](bundles.json) conserva 29 assets JS iniciales para control y 26 para V2. Frente a `0d79c93`, el delta final es +1.662 bytes compilados de control y +1.255 de V2; incluye la corrección compartida de caché de la revisión anterior. Los tamaños actuales se contrastaron con los archivos físicos. No se añade una dependencia ni se cambia la estrategia SWR, sus claves, URL, paralelismo de ventanas o deduplicación.

El prop opcional `homeArticleId` de `CategoryArticle` afecta únicamente al marcador de medición Home: `undefined` conserva el ID anterior, `null` expresa identidad no disponible. No modifica claves React, enlaces, estilos o handlers heredados. Las nuevas pruebas incluyen límites de 100/101 caracteres, hash nativo conocido de una ruta de 128, query/fragmento descartados, rutas inválidas y Web Crypto ausente.

La matriz anterior de Lighthouse conserva su revisión y límites: no se infieren nuevas mediciones de campo ni la aprobación del tratamiento tradicional desde estos bytes. El mapping remoto GTM/GA4, consentimiento público y cohortes siguen pendientes; el A/B permanece apagado.
