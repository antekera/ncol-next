# Tamaños editoriales e imagen regional inicial

Se compararon 20 corridas anteriores y 20 posteriores a corregir las declaraciones `sizes`, con el mismo runner Lighthouse 13.5.0/Chrome 155, cinco pares frío/caliente en móvil y escritorio. Las 57 identidades editoriales SSR, destacado y fuente crítica coinciden en los snapshots de ambos lados. No se fijaron campañas ni feeds cliente. El servidor/CMS/optimizador tenían cachés calientes; “frío” describe el navegador. No hubo builds, pruebas ni otro Chrome del agente concurrentes durante las corridas; los procesos ajenos no se controlaron.

| Perfil | LCP antes → después (ms) | TBT antes → después (ms) | CLS mediana |
|---|---:|---:|---:|
| Móvil frío | 3946,8 → 3774,4 | 174,5 → 193,5 | 0,000266 |
| Móvil caliente | 973,2 → 995,2 | 165 → 142 | 0,000266 |
| Escritorio frío | 877,3 → 909,0 | 0 → 0 | 0,002073 |
| Escritorio caliente | 270,3 → 263,2 | 0 → 0 | 0,002073 |

Las medianas no superan los presupuestos LCP/TBT/CLS documentados. No se infieren significancia, INP ni p75 de usuarios reales. Los rangos y las métricas restantes están en [antes](before.json) y [después](after.json). Esta comparación aísla foto; no sustituye la validación de la apertura tradicional ni se compara como contenido idéntico con la matriz histórica de `0d79c93`.

## Recursos y revisión de aumentos

Las columnas antes declaraban 260 px para una secundaria de 305 px y 360 px para la imagen regional de 549 px; los compactos regionales declaraban 260 px para 80 px. Se corrigen también las columnas de sección con/sin separador y el carrusel en tablet. El hero conserva exactamente su declaración, optimizador y preload; no se cambian recortes, dimensiones CSS, consultas o tracking. `naturalWidth` es corregido por densidad y no se usa como prueba de resolución física.

La unión de JS inicial compilado del control queda idéntica; V2 aumenta 428 bytes en esta etapa. La transferencia fría de JS propio aumenta 112 bytes. [Inventario](bundles-image-stage.json). La transferencia mediana de imágenes en escritorio frío baja 271.229 → 252.446 bytes, pero en caliente sube 37.697 → 84.869 bytes (+125 %), por encima del umbral de revisión.

**Justificación explícita de esa celda:** los GIF nativos `/ads/migrated/.../desktop.gif` cambian 37.559 → 84.731 bytes medianos; las imágenes restantes transfieren exactamente 138 → 138 bytes en todas esas corridas calientes (píxeles de terceros). Las imágenes editoriales están en caché y no transfieren bytes allí. El aumento completo de 47.172 bytes corresponde a rotación/caché de campañas existentes. Se conserva la publicidad y se acepta esta variación para la comparación del cambio editorial; no se convierte en una mejora publicitaria ni en aprobación de campo. En móvil la categoría “no GIF” incluye publicidad móvil: no debe interpretarse como bytes editoriales. [Desglose por corrida](ad-gifs.json).

## Pruebas y límites

La prueba nativa falló con discrepancia de 45 px antes del arreglo; después pasan 27 casos de geometría en 320/390/767/768/900/1023/1024/1199/1440 px y tres motores, además de los 21 escenarios físicos de recurso crítico y 18 de navegación/filtros/videos: 66 E2E, sin omisiones ni reintentos. Pasan 160 suites/787 pruebas/15 snapshots, lint, tipos y build. Se extrajo el helper de medición para compartirlo, sin duplicarlo. Un caso RED/verde adicional conserva “Todo Zulia” primero incluso con taxonomías en orden inverso.

El diagnóstico posterior detectó un problema independiente en tradicional: la imagen regional inicialmente visible espera a hidratación/observer para descubrirse. El resultado y corrección SSR se documentan en el cierre posterior; estas 40 corridas preceden a esa corrección, que solo cambia el tratamiento tradicional. No se habilita A/B, ni se alteran consentimiento o GTM.

## Descubrimiento SSR y optimización del lead tradicional

La prueba sin JavaScript reproduce primero la ausencia del lead regional en el HTML. Se amplía el opt-in de la primitiva existente: solo esa imagen regional de tradicional se renderiza inicialmente, conservando `loading="lazy"` sin prioridad alta ni preload. El navegador decide la proximidad móvil. Se reutiliza el optimizador Next con una fuente de hasta 1134 px para admitir densidades mayores; las otras imágenes conservan su comportamiento. Otro RED/verde verifica que el recurso viene del endpoint Next, no del JPEG directo. El endpoint admite su slash final configurado: una expectativa inicial demasiado literal se corrigió a pathname, sin cambiar la aplicación.

El diagnóstico nativo usa Chrome 155, contexto frío, 1350×940/DPR 1, red CDP 562,5 ms/1474,56 kbps y CPU 4×. Para titular actual/corto, la imagen regional (misma noticia y área visible 120.556 px²) pasa de **8084/8296 ms** a **3512/3680 ms** con SSR y a **3316/3316 ms** con SSR/Next. Es una observación por caso/etapa, no una distribución, Lighthouse simulado ni campo. Las campañas cambian; no se les atribuye esa mejora. Se observan cero errores de hidratación. [Antes](native-before-ssr.json), [SSR](native-ssr-only.json), [SSR/Next](native-optimized.json), [probe exacto de escritorio](desktop-probe.mjs.txt). Copiar ese snapshot textual a un archivo `.mjs` y ejecutar desde la raíz con Node 24 y un servidor tradicional de QA en 3212; exige un destino nuevo. Los colectores y contadores se interceptan; no se ocultan anuncios.

Los gates de esta etapa son 160 suites/787 pruebas/15 snapshots, lint y build. La ejecución independiente de tipos pasa después del build; el intento simultáneo falló porque `.next/types` estaba regenerándose, sin errores de fuente. El inventario compilado final se registra [separadamente](bundles-final.json). El cierre E2E y la matriz comparativa final se registrarán después de terminar; los resultados de la etapa anterior permanecen identificados.

El cierre funcional del código con SSR/Next pasa **96 escenarios E2E**, sin skips ni reintentos: 66 fotográficos (geometría, recursos y UI) y 30 tradicionales (incluidos seis sin JavaScript, ausencia de preload fantasma y navegación/control/internas). Los seis casos de UI que requieren hero fotográfico se ejecutan en el servidor fotográfico; no se omiten del cierre. Knip conserva cinco candidatos/34 registros conocidos, sin archivos/dependencias retirados. La comparación Lighthouse del build final continúa pendiente y no debe reemplazarse por el diagnóstico de una sola observación.
