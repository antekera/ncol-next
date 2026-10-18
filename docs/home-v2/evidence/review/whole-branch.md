# Revisión completa de rama

Revisión independiente de `873645e117a061db8fbe500493eaf6742b5d8c7a..d68f4da`, según `executing-plans`/`requesting-code-review`. Un único revisor fresco, lectura de código y evidencia, sin modificar archivos ni ejecutar pruebas, builds o navegadores. No se solicita otra revisión tras las correcciones: cada hallazgo se verifica con regresión RED/verde y la suite.

## Resultado recibido

No encontró defectos críticos ni observaciones menores adicionales. Dictamen: **no lista para merge**; un PR borrador debe conservar los pendientes del Goal.

1. **Importante — miniaturas ausentes:** `HomeImage` devuelve `null` ante imagen ausente/inválida. En los grids compactos de 80/92 px, el único `cardCopy` restante ocupa la columna de miniatura y deja el resto vacío. Afecta Zulia y secundarias móviles/tradicionales. El RED nativo observa 92 px para un enlace de 358 px. Corrección: la copia que es primer hijo ocupa todas las columnas. El caso con fotografía conserva su layout. La prueba de navegador simula exactamente la ausencia del nodo `picture`, con texto y CSS reales; una prueba de componente comprueba ese contrato para datos nulos/inválidos. No es una medición de rendimiento ni escritura CMS.
2. **Importante — clic temprano:** el template instala el listener Home antes de que termine el import diferido del adaptador de lectura. `readingBridge` no tiene callback todavía y pierde el origen, incluso con permiso QA explícito. El RED retiene el chunk de lectura, navega de verdad a la noticia y encuentra los orígenes vacíos. Corrección: montar sincronamente la captura permitida antes del listener Home; diferir únicamente la observación DOM de destino. Se conserva el coordinador, almacenamiento aprobado, deduplicación y `GAEvent` existentes, sin otra identidad o transporte. El callback comprueba también una revocación antes de recibir la notificación del observer.

Las correcciones y pruebas finales se registran al cerrar la pasada; los hallazgos no se consideran resueltos por esta descripción sola.

## Decisiones sobre los aspectos que el revisor dejó pendientes

- **Consentimiento público, cohortes estables y caché desplegada:** siguen abiertos en fase 10. No se simula una política ni se activa tráfico; coste de mantener la puerta: falta terminar la preparación pública tras recibir la política existente.
- **GTM/GA4 remoto:** siguen pendientes Preview/DebugView, recepción y duplicados reales. El borrador offline y las pruebas locales no los acreditan; coste: medición pública sin aprobar.
- **Dailymotion:** se conserva el fallback heredado hasta disponer del Player ID propio; coste: reproducción confirmada de ese proveedor pendiente, sin inventar cuenta.
- **Comparación final:** la matriz de `d68f4da` se interrumpió al conocerse los defectos. Conserva veinte controles completos y una muestra fotográfica parcial; no se presenta como matriz final. Se medirá el código corregido; coste: repetir únicamente la comparación necesaria.
- **Campo, retorno e ingresos/viewability:** no hay muestra suficiente V2 ni acceso validado a todos los resultados externos. Se conservan las fuentes, métricas y puertas del Goal; coste: resultados de experimento todavía desconocidos. El laboratorio no los sustituye.
- **Selección móvil:** se mantienen todas las secciones mientras se recibe la preferencia editorial solicitada. No se elimina contenido por inferencia de una captura; coste: longitud móvil mayor y aceptación visual editorial pendiente.
- **Publicación WordPress/CDN:** las pruebas aisladas certifican caché/invalidation local, no el pipeline desplegado. No se escribe al CMS ni se invalida CloudFront para simular esa aprobación; coste: validación operativa pendiente antes de distribución.

## Decisiones previas registradas durante la ejecución

1. Reutilizar la rama/checkout solicitado y ya creado: evita otra copia y conserva el estado elegido; riesgo de contención de builds mitigado con servidor propio y ejecución serial de mediciones.
2. Mantener fases 1–12 y ledger explícito en lugar de briefs generados que exigen encabezados `Task N`: coste administrativo, sin cambiar aceptación.
3. Separar orquestación pura `loadHomeV2Data` y wrapper de caché `getHomeV2Data`: permite probar el flujo real sin dispatcher Next; coste de mantener una frontera adicional.
4. Extender clientes existentes y usar `revalidate: 0` dentro de la caché editorial explícita de una hora: evita acumular la caché heredada de una semana; coste de consultas de origen en misses.
5. Evitar caché persistente ante fallo parcial y conservar hermanos renderizables: permite recuperar antes de una hora; coste de reintentos adicionales mientras falla el origen.
6. Actualizar la ruta obsoleta del stylesheet Prettier y excluir copias generadas `.superpowers`/`.kilo/worktrees` de ESLint: todo `src` sigue analizado; coste de no aplicar el lint raíz a copias generadas.

## Cierre de la pasada de correcciones

Ambos hallazgos tienen RED nativo y cierre verde en Chromium/Firefox/WebKit. El código final supera **789 unitarias/15 snapshots, 100 E2E fotográficos/control y 48 tradicionales**. Hay dos omisiones explícitas del muestreo cronometrado en Firefox/WebKit; aperturas, segunda noticia y clics tempranos sí se verifican en los tres motores. No hay reintentos automáticos. La prueba de lectura retiene realmente el chunk de destino durante clic/navegación normal y nueva pestaña, comprueba el origen persistido antes de liberarlo y recibe después una sola apertura atribuida. El permiso revocado también se comprueba antes de la notificación del observer.

La primera regla CSS quedó accidentalmente limitada a tradicional: la regresión lo detectó y el cierre usa una única regla `.cardCopy:first-child` global al módulo, sin cambiar otras reglas. Se conservan los logs fallidos. Un test posterior detectó dos peticiones de ranking separadas por 279 ms: la traza demuestra referentes distintos (`/home-v2-preview/` de preparación y la visita auditada). Se corrigió el contador para limitarse al documento auditado; mantiene la exigencia de exactamente una petición por ventana. No se cambió el fetcher, caché ni revalidación. Las 48 tradicionales pasan después de esa corrección del harness.

El inventario inicial añade **8294 bytes compilados** a ambas rutas para capturar el origen antes de navegar; conserva 29/26 assets JS. No son bytes HTTP ni tiempos de hidratación. El scanner pesado sigue diferido y no hay otro runtime de sesión, transporte, dependencia o identificador de lector. [Inventario físico](bundles.json), [fuentes y gates](source-and-gates.json). Knip mantiene cinco archivos candidatos/34 registros conocidos; no hay nuevas eliminaciones.

El revisor no ha re-revisado estas correcciones; la pasada se cierra mediante regresiones y suite, según el flujo acordado. El Goal y el dictamen de merge siguen abiertos por las puertas declaradas. La comparación Lighthouse final del código corregido se añade por separado.
