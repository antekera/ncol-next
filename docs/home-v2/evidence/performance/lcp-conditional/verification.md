# LCP tradicional: candidato condicionado por contenido

Código `62fce8a`, continuación de `7a24a0c`, Node 24.19.0. A/B público apagado. **La regresión sigue sin aprobarse.** [Datos saneados y hashes](diagnostic.json).

## Qué demuestra el diagnóstico

Las trazas anteriores elegían una imagen de `sticky-bottom` de 32.000 px², mayor que el candidato editorial de texto de 27.534 px². En la reproducción actual el h1 mide 40.096 px² y es el LCP, aunque el mismo slot publicitario continúa cargándose después. Esta diferencia de candidato no acredita por sí sola que la cadena publicitaria se haya acelerado. Tampoco se atribuye todo el cambio histórico al titular sin comparar el contenido exacto de ambas capturas.

Se hicieron seis corridas móviles sobre el build `7a24a0c`, desde la misma ruta local, con GTM/vista existentes y collectors bloqueados. Son una muestra por configuración, no la matriz final ni datos de campo:

| Método y caché de navegador | Control | Tradicional con titular real actual |
| --- | ---: | ---: |
| Lighthouse 13.5, simulación, fría | 11,678 s | 5,306 s |
| Lighthouse 13.5, simulación, caliente | 0,923 s | 0,845 s |
| Lighthouse 13.5, throttling DevTools, fría | 3,696 s | 1,942 s |

La simulación usa un modelo de dependencias; los otros valores observan una carga bajo throttling sintético. No mezclar sus cifras ni denominarlas usuarios reales. [Documentación oficial de throttling](https://github.com/GoogleChrome/lighthouse/blob/v13.5.0/docs/throttling.md).

## Fixture consistente entre servidor y cliente

Se añadió únicamente a la auditoría local tradicional el parámetro `__ncol_home_audit_headline=short`. Solicita un título fijo de 32 caracteres en una copia de los datos **antes del render del servidor**. HTML y payload de React reciben el mismo texto; se conserva ID/URI y no se modifica el objeto editorial cacheado. Requiere ambos flags locales, tratamiento tradicional y ausencia de entorno Vercel; valores arbitrarios o arrays se ignoran. No asigna variantes ni habilita el A/B.

Una exploración previa sustituyó texto con un MutationObserver. No se usa como evidencia comparativa de tiempos: puede desalinear HTML e hidratación. La utilidad comprometida usa la fixture de servidor, no modifica el DOM y rechaza errores de hidratación observados, falta de candidatos o creatividad pendiente.

Con Chrome **155.0.8059.80**, 412×823, DPR 1,75, contextos nuevos, latencia de petición 562,5 ms, descarga 1.474,56 kbps, subida 675 kbps y CPU ×4, la medición directa posterior da:

| Contenido | LCP observado | Candidato | Inicio de campañas | Fin de imagen del sticky |
| --- | ---: | --- | ---: | ---: |
| Titular actual, 66 caracteres | 1,752 s | h1, 40.096 px² | 6,105 s | 7,979 s |
| Fixture SSR, 32 caracteres | **7,960 s** | sticky, 32.000 px² | 6,055 s | 7,923 s |

La creatividad está visible y cargada en ambos casos. No se observaron errores de hidratación en los listeners del diagnóstico. El contexto usa Chrome de escritorio con viewport móvil y throttling CDP; no es el mismo método que Lighthouse ni un dispositivo físico. Es un diagnóstico acotado, no una distribución estadística. Los tamaños de respuesta cross-origin no disponibles se registran como `null`.

El contenido editorial aparece pronto, pero campañas empiezan alrededor de los seis segundos. En la traza DevTools previa, varios scripts propios terminan entre 4,3 y 4,6 s y la consulta comienza a 6,1 s. Queda por identificar y reducir el trabajo de arranque/hidratación que precede a esa consulta; no se atribuye aún todo el tramo a un paquete concreto. El resultado con el título actual no cierra este problema.

## Corrección limitada y comprobada

El slot fijo del viewport dejó de esperar a `DeferredRender/requestIdleCallback`. El popup permanece dentro de su wrapper y conserva su temporizador de tres segundos, selección y cierre. No se cambian creatividades, endpoints, IDs, dimensiones, filtros, caché, transporte ni contador nativo.

La prueba RED retiene callbacks de idle y entrega la campaña: se recibe una consulta, pero cero imágenes del sticky. Tras el cambio se solicita y muestra una creatividad antes de liberar idle, sin duplicar la consulta. El popup sigue ausente antes de liberar idle y durante los primeros 700 ms posteriores; aparece después con su temporizador existente. Esta prueba elimina una dependencia innecesaria; **no demuestra mejora global de LCP**, como deja claro la fixture SSR de 7,96 s.

Gates: **150 suites/725 tests/15 snapshots**, lint, TypeScript y build pasan. **69 E2E sin reintentos** cubren 36 casos publicitarios control/tradicional en 390/1440 px, 12 de apertura tradicional/fixture SSR, 18 de analítica existente y tres de navegación Home/categoría/artículo, en Chromium/Firefox/WebKit. El control y las páginas internas se conservan. No se retiraron dependencias ni archivos.

## Reproducción y siguiente trabajo

Con Node 24, Chrome instalado y un build/servidor local en 3212, usar `HOME_V2_PREVIEW_ENABLED=true`, `HOME_V2_PERFORMANCE_AUDIT=true`, `HOME_V2_PREVIEW_TREATMENT=traditional`, `VERCEL`/`VERCEL_ENV` vacíos. Para medir el montaje analítico actual, construir y arrancar también con su fixture de QA explícita. La utilidad bloquea collectors GA y `/api/track`; no cambia las integraciones publicadas.

```sh
node scripts/home-v2/lcp-headline-probe.mjs /tmp/home-v2-lcp-short-01.json --throttled
```

El fichero debe ser nuevo; la utilidad rechaza sobrescrituras y limpia los contextos/navegador al terminar. Los informes completos Lighthouse/trazas se retienen en `.superpowers/sdd/2026-10-17-home-v2/lcp-current-diagnostic`, fuera de Git; sus hashes están en el JSON saneado. Gates finales: `initial-sticky-build-final.log`, `initial-sticky-unit-final.log`, `initial-sticky-lint-final.log`, `initial-sticky-types-final.log`, `initial-sticky-e2e-final.log` en ese mismo directorio de trabajo.

Continuar con el grafo JavaScript y el perfil de CPU/hidratación antes de otra matriz completa. No retirar SDKs usados ni alterar políticas de observabilidad por un reporte estático. Repetir la comparación final móvil/escritorio con las dos aperturas y contenido representativo, incluyendo titulares cortos. Los p75 de campo V2, su muestra suficiente y la aprobación de rendimiento permanecen pendientes.
