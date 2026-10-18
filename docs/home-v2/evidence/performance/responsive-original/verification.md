# Regresión móvil localizada en el original responsive

Build de código `d991b50`, **anterior a la corrección de imagen crítica**. El A/B sigue apagado. [Resultados y hashes](diagnostic.json), [control](control-summary.json), [V2 fotográfica](photographic-summary.json).

## Comparación de laboratorio

40 corridas en serie, Lighthouse 13.5.0/Chrome 155/Node 24.19.0, cinco por dispositivo/estado de caché de navegador/variante. Misma raíz local, vista/dataLayer/GTM existentes, anuncios y scripts reales; únicamente colectores bloqueados. No hubo otros builds, pruebas o sesiones Chrome concurrentes. Laboratorio con throttling simulado, sin INP ni p75 de usuarios reales.

| Dispositivo/caché | LCP control | LCP foto | CLS control → foto | TBT control → foto |
| --- | ---: | ---: | ---: | ---: |
| Móvil fría | 5.509 ms | **8.076 ms** | 0,0333 → 0,00027 | 191 → 177 ms |
| Móvil caliente | 788 ms | 988 ms | 0,0333 → 0,00027 | 150 → 147 ms |
| Escritorio fría | 1.077 ms | 1.053 ms | 0,0142 → 0,00272 | 0 → 0 ms |
| Escritorio caliente | 215 ms | 219 ms | 0,0142 → 0,00272 | 0 → 0 ms |

Son medianas; los resúmenes conservan todos los rangos, advertencias, candidatos LCP, recursos y causas CLS. El móvil frío empeora 2.567 ms/46,6 %: excede el presupuesto y **no se aprueba**. El incremento caliente exacto es 199,76 ms/25,3 %; no cruza simultáneamente los dos límites de 200 ms/10 %, aunque merece seguimiento. No se usa la mejora de CLS para compensar LCP. Las primeras muestras frías alcanzan 13,68 s control y 16,70 s foto y permanecen en la evidencia.

## Causa comprobada

El primer informe móvil identifica el hero como candidato LCP de ambas portadas. El control descarga el derivado JPEG 660×371, 44.485 bytes decodificados. V2 ofrece 175/374/660/1120w y el navegador elige el original 1120w: 571.161 bytes. La declaración `100vw` tampoco descuenta los 32 px de padding; el slot observado mide 380 px a viewport 412/DPR 1,75. El salto al original y su codificación costosa requieren corregir la carga, sin reducir dimensiones visibles ni excluir anuncios.

La duración observada del insight no es el LCP simulado: en esas primeras muestras el render observado ronda 591 y 912 ms, mientras el modelo de red informa 13,68/16,70 s. No se mezclan ambos métodos ni se atribuye todo el tiempo a hidratación.

Un GET local al optimizador **ya existente**, con el mismo original, ancho 750 y calidad 75, responde HTTP 200/WebP/29.320 bytes. Demuestra compatibilidad local de entrada y formato, no una mejora CWV, descarga única en la página, latencia comparativa ni funcionamiento desplegado de AWS. La corrección debe probarse con navegación y otra matriz.

## Caché y límites

Las capturas SSR inicial/final mantienen la secuencia de marcadores: uno del control y 47 de V2. El control conserva HIT/`s-maxage=3600`; V2 emite documento privado sin caché y conserva la caché editorial existente. La captura inicial se obtuvo después de arrancar el runner. No acredita contenido congelado de feeds cliente, creatividades aleatorias, caché CMS/CDN fría o aislamiento de cohortes desplegado. Se conservan esas limitaciones.

Esta matriz no cubre tradicional ni la nueva corrección. Debe conservarse como diagnóstico previo, sin sustituir baseline inicial ni declararla comparación final aprobada. La muestra de campo de V2 continúa ausente mientras el experimento permanece apagado.
