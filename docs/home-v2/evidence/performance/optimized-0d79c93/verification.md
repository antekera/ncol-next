# Comparación actual: foto mejora; tradicional conserva riesgos LCP

Código de aplicación `0d79c93`, Node 24.19.0, Lighthouse 13.5.0 y Chrome 155. A/B público apagado. **No hay aprobación global de rendimiento.** [Comparación y flags de revisión](comparison.json), [manifiesto de informes](reports-manifest.json).

## Método

80 corridas en serie: control, foto, tradicional con titular actual y fixture tradicional con titular corto, cada una con cinco repeticiones por móvil/escritorio y caché fría/caliente de navegador. Build de producción, misma raíz local y vista/dataLayer/GTM existentes. Anuncios/scripts reales; solo colectores GA y `/api/track` bloqueados. No se ejecutaron builds, tests o sesiones Chrome de diagnóstico adicionales durante la matriz; la carga ajena del equipo no está controlada.

Las filas son medianas, con todos los valores/rangos/advertencias en los cuatro resúmenes. Se conserva también la matriz anterior que localizó el JPEG original. Caché fría significa **navegador**: transformación de imagen, WordPress y CDN pueden estar calientes. La transformación Next local no certifica latencia fría o comportamiento desplegado de AWS. La captura inicial de documentos se tomó después de arrancar el runner; los fingerprints SSR inicial/final son estables y el primer artículo coincide entre grupos, pero no congelan feeds cliente ni creatividades. [Documentos](documents.json).

## Resultados y presupuestos

| Grupo | Móvil fría LCP / TBT / CLS | Móvil caliente LCP / TBT / CLS | Escritorio fría LCP / CLS | Escritorio caliente LCP / CLS |
| --- | --- | --- | --- | --- |
| Control | 5.502 ms / 232,5 ms / 0,0333 | 803 ms / 149,7 ms / 0,0324 | 1.121 ms / 0,0142 | 215 ms / 0,0142 |
| Foto | **4.370 ms / 187 ms / 0,00027** | 999 ms / 145,5 ms / 0,00027 | **857 ms / 0,00272** | 264 ms / 0,00272 |
| Tradicional, título actual | 3.629 ms / 184 ms / 0,00057 | 849 ms / 137,5 ms / 0,00057 | **3.298 ms / 0,00272** | **975 ms / 0,00272** |
| Tradicional, título corto fixture | **15.177 ms / 199 ms / 0,00057** | **3.708 ms / 181 ms / 0,00057** | **3.252 ms / 0,00272** | **864 ms / 0,00272** |

TBT de escritorio es cero en las cuatro configuraciones. TBT es diagnóstico de laboratorio y **no es INP**. Los umbrales LCP ≤2,5 s, INP ≤200 ms y CLS ≤0,1 corresponden a p75 de campo; no se declaran alcanzados desde esta tabla.

Foto mejora LCP frío 20,6 % móvil y 23,5 % escritorio frente al control actual. El incremento caliente móvil es 196,60 ms/24,5 %: queda por debajo del límite absoluto de 200 ms del presupuesto conjunto 10 %/200 ms, con poco margen. Escritorio caliente aumenta 49,14 ms. Foto no cruza los presupuestos medianos de LCP/TBT/CLS/JS considerados; no se extiende esa conclusión al tratamiento tradicional ni a campo.

Hay **seis celdas LCP que requieren revisión**: escritorio frío/caliente de tradicional y las cuatro de titular corto. Permanecen señaladas aunque CLS y TBT sean mejores. No se usa el score global para aprobarlas. En foto móvil frío, rango 3.927–5.296 ms frente a 5.467–13.239 ms del control; los resúmenes conservan los demás rangos sin ocultar outliers.

## Recursos, consultas e hidratación

En frío, JS de primera parte transferido: móvil control 501.761 bytes/foto 511.286 (+9.525); escritorio control 539.650/foto 511.286 (−28.364). Dentro del presupuesto de aumento >10 % o >20 KiB. Los scripts de terceros y sus variaciones se conservan por separado; no se atribuye todo el delta al frontend. [Grafo de bundles y validación funcional](../critical-image/verification.md).

HTTP mediano control→foto: móvil frío 100→100, caliente 102→103; escritorio frío 119→107, caliente 121→109. Imágenes transferidas en frío: móvil 122.386→89.701 bytes; escritorio 219.776→261.619. En escritorio se observan 12→15 imágenes y composición editorial distinta; ese aumento requiere revisión por contenido/viewport y no demuestra solicitudes duplicadas. No se afirma que todos los bytes/imágenes mejoren.

Documento mediano: control 29.020 bytes transferidos/153.038 decodificados; foto 44.016/240.003. El contenido editorial SSR es más amplio; el coste extra queda explícito. Solicitudes WordPress **en el navegador**: control 4 frío/2 caliente, foto 0. No significa cero consultas CMS: V2 usa la composición compartida y caché del servidor. Los probes de datos previos acreditan dos consultas editoriales y los feeds independientes existentes; esta matriz no vuelve a medir caché CMS fría. [Datos y límites](../data/fields-comparison.json), [Opinión compartida](../../analytics/opinion-data/verification.md).

Los perfiles de hidratación/CPU previos, el splitting de formularios y el coste de observadores mantienen su evidencia separada. Este reporte no convierte bytes, TBT o `mainthread-work-breakdown` en una medición aislada de hidratación.

## Causa publicitaria: evidencia y límites

[Red observada](ad-chain.json) muestra el sticky como LCP en 5/5 muestras de escritorio tradicional y 5/5 en ambos dispositivos del título corto; no aparece como LCP del control/foto. El cambio de área editorial hace elegible al banner existente: escritorio 970×90 px; móvil 320×100. Los tiempos de red de esos informes son observados en la traza, mientras sus LCP principales son simulados. No mezclarlos.

Se añadieron tres diagnósticos nativos separados, sin Lighthouse concurrente: Chrome 155, 412×823/DPR 1,75, latencia CDP 562,5 ms, descarga 1.474,56 kbps, CPU ×4, contextos nuevos. Misma creatividad (SHA verificada), misma geometría 320×100, carga completa y sin errores de hidratación observados. Una muestra por caso:

| Caso | Último LCP observado | Catálogo anuncios empieza → termina | Imagen sticky termina |
| --- | --- | --- | ---: |
| Control | Imagen editorial, 1,912 s | 6,279 → 6,939 s | 8,052 s |
| V2 tradicional, título actual | H1 editorial, 1,744 s | 5,672 → 6,363 s | 7,541 s |
| V2 tradicional, título corto | Sticky, **7,760 s**; párrafo editorial previo a 1,976 s | 5,841 → 6,517 s | 7,723 s |

[Datos nativos saneados](native.json). El anuncio ya llega tarde en el control; esta muestra no muestra una nueva demora de red del mismo recurso en V2. La promoción del sticky a candidato explica el salto del indicador. La disponibilidad de la imagen no demuestra igualdad estadística de visibilidad/ingresos ni resuelve el p75: solo hay una muestra por caso y no se mide toda la distribución de pintura publicitaria.

Se preservan dimensiones, fuentes, selección, cierre, IDs y contadores compartidos. Es la razón de compatibilidad para no reemplazar arbitrariamente la integración durante este diagnóstico. **No es una aprobación de las regresiones**: el arranque publicitario/cliente y la justificación o resolución final del tratamiento tradicional continúan abiertos. Cualquier propuesta posterior debe conservar monetización y evitar aumentar solicitudes o modificar permisos de almacenamiento. El A/B permanece apagado.

## Campo y continuación

CrUX disponible del Home público histórico: ventana 17 de septiembre–14 de octubre, móvil LCP 1,7 s/INP 195 ms/CLS 0,08; escritorio 1,7 s/104 ms/0,09. [Fuente y ventana](../field/crux-control-2026-10-17.json). Es anterior a esta rama, no compara V2 ni autoriza mezclar estos p75 con laboratorio. V2 continúa sin muestra real por variante mientras está apagado; las muestras `local-qa` se excluyen de campo.

Pendientes: cerrar tradicional, validar publicación/edición/revalidación y recuperación de errores con caché real Next en un entorno aislado, completar cohortes/consentimiento y GTM/GA4, revisión de aceptación y PR. Esta matriz aporta resultados comparativos disponibles; el Goal sigue activo.

La utilidad `lcp-headline-probe.mjs` admite ahora `--control` para una muestra del grupo actual y rechaza combinarlo con `--short-only`. Sintaxis Node y ejecución real del control pasan; no modifica la aplicación ni crea otro emisor analítico. El probe V2 precede esa extensión; sus hashes y los de todos los informes están en el manifiesto. No se repiten tests/build de aplicación por este cambio de diagnóstico/documentación.

Método de referencia: [Lighthouse 13.5, throttling simulado y aplicado](https://github.com/GoogleChrome/lighthouse/blob/v13.5.0/docs/throttling.md).
