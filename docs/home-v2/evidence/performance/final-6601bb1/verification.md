# Comparación final de laboratorio: productor Home activo

Aplicación **`6601bb1`**, Node 24.19.0, Lighthouse 13.5.0 y Chrome 155. Las revisiones posteriores solo cambian pruebas/documentación. **160 corridas completas**: 80 con los observadores de Home apagados y otras 80 con `__ncol_home_measurement=1`, cinco pares frío/caliente por dispositivo y tratamiento. La segunda serie incluye productor dataLayer, observadores visibles y Web Vitals QA. La captura/lectura QA usa el mismo permiso explícito en ambas series.

El protocolo inicial omitía el flag de observadores. Esa serie se conserva identificada como referencia de composición, y se repitió la comparación completa con el productor activo. **No se presentan las primeras 80 como aprobación del coste analítico completo.**

Estas son navegaciones locales secuenciales, **no el experimento A/B de lectores**. La ruta pública sigue en control y no hay selección pública de cohortes. El GTM existente se descarga, pero el borrador propio permanece offline/pausado, sin importar ni publicar. Los colectores GA4 y `/api/track` se bloquean. El coste/recepción de la configuración GTM pendiente no quedan validados por estas mediciones.

## LCP con productor Home activo

Medianas en segundos; cada celda conserva cinco valores y sus rangos en los JSON enlazados. No se descartan atípicos.

| Variante | Móvil frío | Móvil caliente | Escritorio frío | Escritorio caliente |
|---|---:|---:|---:|---:|
| Control | 5.517 | 0.792 | 1.071 | 0.215 |
| V2 foto | 3.928 | 0.997 | 0.860 | 0.263 |
| V2 tradicional | 4.068 | 0.845 | 1.012 | 0.241 |
| V2 tradicional, titular corto | 14.625 | 3.531 | 1.049 | 0.265 |

Foto reduce LCP frío **28,8 % en móvil** y **19,7 % en escritorio** frente al control de esta misma serie. Tradicional con titular actual reduce 26,3 % y 5,5 %. Las cuatro regresiones antiguas de escritorio tradicional ya no aparecen: el lead regional se descubre en SSR y usa el optimizador existente. Esto no borra la regresión móvil del titular corto.

## TBT, CLS y JavaScript

| Variante | TBT móvil frío/caliente (ms) | CLS móvil/escritorio |
|---|---:|---:|
| Control | 183.0 / 181.5 | 0.033321 / 0.014187 |
| V2 foto | 236.0 / 166.0 | 0.000266 / 0.002073 |
| V2 tradicional | 180.0 / 69.0 | 0.000573 / 0.002073 |
| V2 tradicional, titular corto | 196.0 / 118.0 | 0.000573 / 0.002073 |

TBT mediano de escritorio es cero en las cuatro variantes. **TBT no es INP**. No hay muestra de usuarios V2 ni p75 de campo nuevo. El [CrUX histórico del control](../field/crux-control-2026-10-17.json) pertenece a otra ventana y a producción, no a esta rama ni a V2. Los objetivos de campo LCP ≤2,5 s, INP ≤200 ms y CLS ≤0,1 se mantienen para cuando exista muestra suficiente.

JS propio transferido en móvil frío: **502.400 bytes control / 512.469 foto** (+10.069; +2,0 %), dentro del presupuesto de 10 % o 20 KiB. La [unión física compilada](../../review/bundles.json) es otra medida: 29 assets/1.535.364 bytes control y 26/1.496.448 V2; la captura síncrona añadió 8294 bytes compilados a ambas rutas. No se equiparan bytes compilados, HTTP, hidratación, TBT ni campo.

## Cuatro alertas temporales: evaluación explícita

Los indicadores `requiresReview` permanecen en [comparison.json](comparison.json). **No se declara que todas las celdas pasan ni se eleva el presupuesto para hacerlas pasar.** Las siguientes excepciones se justifican para cerrar la revisión local del prototipo apagado; no autorizan merge, despliegue, activación ni cumplimiento de CWV de campo.

1. **Foto, TBT móvil frío: 236 frente a 183 ms**, +53 ms (+29 %), tres milisegundos sobre el umbral absoluto de revisión de 50 ms. Rangos: 169–297,5 frente a 178,5–250,5 ms. Es tiempo concentrado en tareas largas durante la carga, no prueba de INP ni de una función específica. El trabajo total de main thread mediano es ligeramente menor (2555 frente a 2585 ms); la atribución de CPU a URLs propias también es menor (1529 frente a 1642 ms). El productor añade trabajo respecto de su propia referencia apagada y la composición SSR entrega más contenido inicialmente; no se atribuyen causalmente los 53 ms a un único componente con cinco muestras y terceros variables. **Decisión:** conservar la precisión de visibilidad/captura y aceptar este coste local documentado junto con el ahorro de 1,589 s de LCP frío y CLS menor. La distribución de tareas/INP debe revisarse con GTM configurado y campo antes de distribuir tráfico. [Diagnóstico CPU y límites](js-cpu-diagnostic.json).

2. **Foto, LCP móvil caliente: 997,189 frente a 792,326 ms**, +204,863 ms (+25,9 %), 4,863 ms sobre el umbral absoluto de 200 ms. En ambas variantes coincide con FCP: no es una imagen caliente que llegue tarde. Se entrega una composición editorial más amplia por SSR: HTML transferido 44.108 frente a 29.016 bytes (+15.092), decodificado 241.219 frente a 153.038. El control solo tiene un marcador de artículo SSR y carga más contenido después; V2 entrega 57. **Decisión:** conservar el contenido inicial y la estrategia de servidor, con este coste caliente explícito y el beneficio frío/CLS. No se elimina contenido para maquillar LCP ni se reintenta hasta obtener un valor verde. No implica que la muestra pruebe una causa exclusiva o significancia estadística.

3. **Titular corto, LCP móvil frío: 14,625 frente a 5,517 s.**
4. **Titular corto, LCP móvil caliente: 3,531 frente a 0,792 s.**

En esas diez corridas el candidato final es el **sticky nativo de 320×100**, a partir de y=723. Las otras 70 corridas instrumentadas tienen candidato editorial. FCP del caso corto es 1,669 s frío / 0,995 s caliente: el contenido aparece antes del anuncio que pasa a dominar LCP. La [evidencia nativa histórica con la misma creatividad](../optimized-0d79c93/native.json) demostró que esa disponibilidad publicitaria tardía ya existía en control; no son tiempos de campo ni mediciones de esta revisión. Los nodos y posiciones actuales confirman el mismo mecanismo, sin afirmar que todas las campañas/redes tengan la misma latencia. **Decisión:** preservar inventario, integraciones y dimensiones existentes; registrar la excepción causada por la jerarquía de candidatos de una apertura sin fotografía. No ocultar/retrasar/reducir anuncios ni agrandar titulares para cambiar el ganador de LCP. La revisión local se cierra con esa justificación; una futura distribución exige evaluar el caso con monetización y campo. No se acredita el objetivo absoluto de LCP. [Nodos por corrida](lcp-and-images.json).

## Recursos: aumentos revisados y mejoras separadas

- Móvil frío foto: imágenes **91.685 frente a 129.669 bytes**; solicitudes totales **99 frente a 100**. Los bytes de imagen bajan aunque hay 10 frente a 9 solicitudes de imagen.
- Escritorio frío foto: imágenes **255.531 frente a 221.667 bytes** (+15,3 %), con 16 frente a 13 solicitudes. Hay más tarjetas/imágenes editoriales iniciales en esa composición, tamaños acordes al CSS y publicidad rotativa. Es un coste de composición/selección, no evidencia de consultas WordPress duplicadas. Las corridas frías/calientes y el desglose de anuncios nativos se conservan; no se extrapola una reducción móvil a escritorio.
- Tradicional móvil caliente transfiere 32.307 frente a 23.645 bytes: los anuncios nativos aportan 32.151 frente a 23.507; la agrupación restante, 156 frente a 138. Titular corto en escritorio caliente transfiere 75.257 frente a 68.372: anuncios nativos 75.119 frente a 68.234 y resto 138 frente a 138. Esas alertas calientes se justifican por campañas/caché, con diferencias pequeñas de píxeles de terceros. En escritorio frío foto, la agrupación de imágenes no nativas tiene mediana de 177.336 frente a 118.521 bytes, mientras baja la de anuncios nativos de 103.146 a 78.274: se acepta expresamente el mayor contenido visual inicial. Las medianas de subgrupos no se suman como si fueran la mediana del total. También se revisan los aumentos de imágenes de tradicional y titular corto. El bloque `/ads/migrated/` se separa en [lcp-and-images.json](lcp-and-images.json); el resto incluye píxeles de terceros y **no es todo editorial**. El inventario y la caché de campañas varían; no se atribuye toda la diferencia a código propio.
- El HTML adicional se acepta expresamente como coste de SSR modular y contenido disponible antes. Los POST/taxonomías del núcleo editorial se comparten; [prueba de caché Next real](../cache-integrity/verification.md). Los cuatro HTTP WordPress del navegador del control incluyen solicitudes/preflight: no equivalen a cuatro operaciones GraphQL ni a cero operaciones de servidor en V2. Opinión y otros servicios mantienen sus consultas de propósito propio.
- Los recursos son una puerta de revisión, no una exigencia de igual número de imágenes en diseños distintos. Se conservan mejoras y aumentos; no hay otra dependencia, transporte, query por tarjeta ni eliminación de publicidad para reducir cifras.

## Protocolo, equivalencia y límites

- Mismo build de aplicación y protocolo Lighthouse; cinco pares por móvil/escritorio, frío/caliente. “Frío” significa navegador; CMS, caché editorial y optimizador podían estar calientes. No se hizo publicación CMS ni invalidación CDN real.
- En la serie activa, los hashes de texto SSR, imágenes/hints e identidades editoriales coinciden antes/después de cada tratamiento. Las 57 identidades V2 y el destacado también se conservan en la referencia apagada. Feeds cliente, campañas y terceros no están congelados. El control comparte el destacado; no se afirma que ambos diseños tengan la misma composición.
- Sin builds, pruebas, hooks de Git u otro Chrome del agente simultáneos a cada medición. La corrección de CI y sus hooks se ejecutaron entre series, con Lighthouse detenido. La actividad ajena del sistema no se controló; no es aislamiento de laboratorio físico ni prueba estadística de causalidad.
- El primer diagnóstico interrumpido de `d68f4da` no forma parte de estas 160 corridas. Se conserva localmente, sin completar ni extrapolar su muestra fotográfica parcial.
- Los hashes identifican los 160 LHR, 160 HTML y 160 traces más índices/resúmenes. No se sustituyen rangos por puntuaciones, ni laboratorio por usuarios reales. [Manifiesto de 496 archivos](reports-manifest.json), [fuentes y snapshots](source-and-editorial.json).

La validación funcional del código medido consta de 789 unitarias/15 snapshots y 148 E2E aprobados, dos omisiones cronometradas explícitas. [Revisión y defectos corregidos](../../review/whole-branch.md), [CI sin credenciales](../../review/ci-fixture.md). El A/B público permanece apagado. Las puertas de consentimiento, cohortes/caché pública, GTM/GA4, Dailymotion y aceptación declaradas en el Goal siguen abiertas.
