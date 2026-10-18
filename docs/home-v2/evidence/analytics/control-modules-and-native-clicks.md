# Control: módulos especializados, gesto nativo y coste de lectura

Código `db93986`, continuación de `4e3d024` en `feat/home-v2-plan`. Validación local opt-in; sin cambios en GTM/GA4 ni activación pública de A/B.

## Cambios y compatibilidad

El Home solicita contexto a los rankings y servicios compartidos. Los defaults de las páginas internas conservan su renderizado y consultas. El ranking móvil de siete días se identifica como `ranking-week`; los de escritorio, de cinco días y de hoy, como `ranking` y `ranking-today`. No se modifican ventanas, cache, endpoints ni orden visual. Servicios ocupa la primera posición de su sidebar actual; ranking y ranking-today ocupan segunda y tercera. La posición del ranking móvil es cuarta en el flujo principal. Los enlaces conservan sus destinos; se añaden identificadores públicos constantes, sin valores de formularios.

Se corrigió un defecto del montaje experimental previo, demostrado con un clic real: el fallback en una microtarea podía adelantarse al handler delegado de React. Producía un `GO_TO_POST` atribuido y otro `RECENT_NEWS` heredado sin contexto. El fallback espera ahora una tarea posterior y solo se emite si el handler existente no consumió el gesto. Los handlers y etiquetas heredados se conservan. La verificación cuenta todos los `CLICK_EVENT`, no solo los experimentales; el comportamiento público habitual no montaba este propietario de QA.

La lectura de destino usa el mismo observer para mantener texto actualmente intersectando y procesa los lotes de entradas antes de decidir cada raíz. Conserva las comprobaciones de geometría actual, foco, oclusión y umbrales; no asume que el observer por sí solo prueba lectura. Evita recorrer cada párrafo fuera de pantalla en cada comprobación periódica. [Par antes/después y límites](reading-visible-text-cost.json).

## Validación

Node **24.19.0**, build local de producción con los tres flags explícitos de QA y `VERCEL`/`VERCEL_ENV` vacíos. `localhost:3212`, Chromium/Firefox/WebKit, 390/1440 px para los módulos del control. Los collectors externos se bloquean. Las pruebas de rankings sustituyen su API por datos editoriales públicos de fixture; las otras pruebas conservan las noticias y navegación reales.

| Comprobación | Alcance |
| --- | --- |
| Unitarias | 150 suites, 725 tests, 15 snapshots; incluye defaults compartidos, posiciones opt-in, cuerpo por streaming, coste de texto fuera de pantalla y checkpoint entre captura/handler |
| Lint, TypeScript y build | Salida 0 de los gates finales |
| Rankings/servicios del control | 6 E2E: módulo y tarjeta realmente visibles, posición, clic heredado único, ranking diario, «Ver más», servicio y deduplicación al volver |
| Analítica Home existente | 18 E2E: control/V2, una vista, clic total único, filtro regional, sección, ranking y servicios |
| Lectura/destino | 10 E2E: apertura, nueva pestaña, segunda noticia, recarga, engagement y revocación; dos muestras temporizadas Firefox/WebKit se omiten explícitamente |
| Navegación compartida | 3 E2E: Home actual → categoría → artículo, tres motores |

La matriz final termina con **37 casos aprobados, dos muestras temporizadas omitidas y salida 0**, sin reintentos.

La primera prueba unitaria de coste falló con **12.200** rectángulos de 200 párrafos fuera de pantalla en seis segundos simulados; ahora registra **0**. La prueba del checkpoint falló con dos eventos y ahora espera exactamente uno con la etiqueta heredada. Un primer gate de build detectó dos accesos sin comprobar al dataLayer opcional en esa nueva prueba; se corrigieron antes del build final. Los gates enfocados no sustituían el umbral global de cobertura; la suite completa posterior lo valida.

Una primera matriz dejó el encabezado móvil del ranking fuera del viewport cuando llegó contenido tardío del control. La impresión se mantuvo correctamente en cero. La prueba vuelve a encuadrar ese encabezado real durante la espera y exige el mismo segundo continuo; no reduce el umbral ni simula una intersección. No se presenta esa primera corrida como aprobada.

En un único par de navegador, la fixture de noticia larga pasó de **4.378 a 22** lecturas de rectángulo en dos segundos y de **4.356 a cero** lecturas de párrafos fuera de pantalla. Los tiempos de las llamadas nativas están cuantizados y no incluyen el coste total del observer/JS/layout. Estos resultados no prueban mejora de INP, hidratación ni p75 de campo y no sustituyen la matriz Lighthouse de aceptación.

Logs locales: `.superpowers/sdd/2026-10-17-home-v2/control-modules-unit-final.log`, `control-modules-lint-final.log`, `control-modules-types.log`, `control-modules-build-final.log`, `control-modules-e2e-verified.log`. La matriz final usa `--retries=0` y directorios de artefactos propios. Las capturas y trazas crudas permanecen fuera de Git.

## Pendiente para el Goal

No se retiraron nuevas dependencias, archivos ni estilos. Se conservan control, páginas internas, integración publicitaria y el plan de limpieza posterior al experimento. Faltan opinión/video del control y señales reales de reproducción, política de consentimiento, mapping/validación remota, preparación final del selector A/B apagado, resolución de LCP tradicional, comparación final de rendimiento/CWV y PR. El Goal permanece activo; la aprobación de laboratorio no se confunde con datos reales de usuarios.
