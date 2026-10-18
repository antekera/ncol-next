# Home V2: rendimiento

## Alcance y protocolo

La línea base inicial corresponde a `873645e` (17-10-2026). La comparación final corresponde a la aplicación `6601bb1`; el guard de errores de autores posterior no se presenta como una nueva medición de rendimiento. Los diagnósticos intermedios y archivos generados se conservan fuera de Git.

Node 24.19.0, Next 16.4.0/Webpack, Chrome 155 y Lighthouse 13.5.0; build de producción. Cinco pares frío/caliente por dispositivo y tratamiento, en serie. Lighthouse usa sus perfiles móvil/escritorio predeterminados; los recorridos funcionales usan 390×844 y 1440×900. No hay builds, tests u otro Chrome del agente simultáneos a las corridas; la actividad ajena del sistema no está controlada.

«Frío» significa caché del navegador, no de WordPress, CDN ni optimizador. Se conservan anuncios/GTM; se bloquean colectores GA4 y `/api/track` durante QA. Se verifican identidades, texto SSR e imágenes antes/después; campañas, feeds cliente y terceros pueden variar. No se selecciona solo el mejor resultado ni se atribuye significancia estadística a cinco muestras.

## Línea base inicial del control

20 corridas completas, cinco por dispositivo/caché. Medianas de laboratorio:

| Métrica | Móvil frío/caliente | Escritorio frío/caliente |
|---|---:|---:|
| LCP | 5670 / 783 ms | 1154 / 215 ms |
| TBT | 184,5 / 138,7 ms | 0 / 0 ms |
| CLS | 0,0732 / 0,0719 | 0,0703 / 0,0138 |

Dispersión relevante: una corrida móvil fría alcanza LCP 12241 ms y una caliente CLS 0,1533. La imagen principal es el candidato LCP. El recorrido con scroll registra 218 solicitudes de escritorio y 198 móviles, incluidos terceros; no equivale al conteo de una carga inicial Lighthouse.

WordPress: cinco GraphQL POST de navegador por dispositivo (cuatro `CoverPost`, un `VideoPosts`), con duraciones de 725–1009 ms en escritorio y 281–1023 ms en móvil. Son operaciones distintas por columnas/paginación, con artículos parcialmente repetidos. La regeneración local SSR registra `RecentFromCategory`, 979 ms, primer MISS y dos HIT posteriores sin otra consulta. Esa invalidación local no certifica publicación/CDN desplegados.

## Comparación final con productor Home activo

160 corridas: 80 de referencia sin observadores y 80 con observadores/dataLayer/Web Vitals QA activos. La primera serie omitió el flag de medición; se conservó identificada y se repitió completa. La tabla usa exclusivamente la serie activa. El borrador GTM sigue offline/pausado: su coste completo y recepción remota no quedan acreditados.

| Variante | LCP móvil frío/caliente | LCP escritorio frío/caliente | TBT móvil frío/caliente | CLS móvil/escritorio |
|---|---:|---:|---:|---:|
| Control | 5517 / 792 ms | 1071 / 215 ms | 183 / 181,5 ms | 0,033321 / 0,014187 |
| V2 foto | 3928 / 997 ms | 860 / 263 ms | 236 / 166 ms | 0,000266 / 0,002073 |
| V2 tradicional | 4068 / 845 ms | 1012 / 241 ms | 180 / 69 ms | 0,000573 / 0,002073 |
| V2 tradicional, titular corto | 14625 / 3531 ms | 1049 / 265 ms | 196 / 118 ms | 0,000573 / 0,002073 |

TBT de escritorio es cero. Foto reduce LCP frío 28,8 % móvil y 19,7 % escritorio; tradicional con titular actual mejora 26,3 % y 5,5 %. Los rangos móviles fríos de control/foto son 5478–13198 y 3473–4220 ms, respectivamente; se conserva el atípico del control.

## Regresiones y decisiones

Los presupuestos de revisión permanecen: LCP >10 % y >200 ms; TBT >10 % y >50 ms; JS >10 % o >20 KiB. Las cuatro alertas de tiempos siguientes tienen justificación para revisión local del prototipo apagado; no autorizan merge, despliegue ni cumplimiento de campo.

1. Foto, TBT móvil frío: 236 frente a 183 ms (+53 ms, +29 %); rangos 169–297,5 frente a 178,5–250,5. Main thread total 2555 frente a 2585 ms y CPU atribuida a URLs propias 1529 frente a 1642. Se conserva la precisión del productor y el beneficio LCP/CLS; no se atribuye la diferencia a una sola función ni se presenta como INP. Revisar distribución de tareas con GTM completo/campo antes de distribuir tráfico.
2. Foto, LCP móvil caliente: 997,189 frente a 792,326 ms (+204,863 ms, +25,9 %), coincidente con FCP. HTML transferido 44108 frente a 29016 bytes; V2 entrega 57 marcadores de artículo SSR frente a uno en control. Se acepta expresamente ese coste local de composición inicial con su beneficio frío; no se quita contenido para maquillar el resultado.
3. Titular corto, LCP móvil frío: 14,625 frente a 5,517 s.
4. Titular corto, LCP móvil caliente: 3,531 frente a 0,792 s.

En las diez corridas del titular corto el candidato final es el sticky nativo 320×100, y=723. FCP es 1,669/0,995 s: el contenido aparece antes del anuncio. Diagnósticos nativos previos con igual creatividad constataron disponibilidad tardía también en control; no son mediciones de campo ni del mismo build final. Se preservan inventario, dimensiones e integración; no se oculta/retrasa/reduce publicidad para cambiar el candidato. La excepción local requiere evaluación de monetización/campo antes de lanzamiento y no acredita el objetivo absoluto LCP.

## Datos, imágenes, JavaScript y renderizado

- Composición editorial de servidor con filtros/video/feeds cliente. Núcleo compartido: dos POST (taxonomías y consulta editorial para diez módulos), sin consulta por tarjeta. El payload editorial observado baja 35,5 % con iguales IDs. Opinión/servicios conservan solicitudes propias. Las duraciones dependen de caché/red: no se extrapola esa reducción a latencia garantizada.
- Caché Next real: hits compartidos e invalidación por portada/categoría, recuperación HTTP/GraphQL parcial sin persistir fallos una hora; contrato anterior de datos parciales preservado. Flujo de publicación WordPress y CloudFront desplegado pendiente. SST/AWS/OpenNext es la infraestructura real.
- Optimizador Next existente para imagen crítica y lead tradicional SSR; `sizes` ajustado a nueve anchos, dimensiones reservadas y lazy loading fuera de pantalla. Solo la imagen crítica se prioriza; no se cambia globalmente el bypass CDN heredado de `SafeImage`.
- Foto móvil frío: imágenes 91685 frente a 129669 bytes; 99 frente a 100 solicitudes totales. Escritorio frío: 255531 frente a 221667 bytes (+15,3 %), 16 frente a 13 imágenes. Se acepta expresamente el coste visual inicial adicional; no implica consultas duplicadas. Los recursos varían además por campañas/píxeles de terceros.
- Imágenes calientes: tradicional móvil 32307 frente a 23645 bytes, de los cuales anuncios nativos 32151/23507. Titular corto escritorio 75257/68372, anuncios 75119/68234. Las alertas se documentan por inventario/caché, sin extrapolar ahorro móvil a escritorio ni sumar medianas de subgrupos como mediana total.
- JS propio HTTP móvil frío: 502400 bytes control y 512469 foto (+10069; +2,0 %), dentro de presupuesto. Unión física compilada inicial: control 29 assets/1535364 bytes; V2 26/1496448. Captura síncrona de origen añade 8294 bytes compilados a ambas rutas. Bytes compilados/HTTP, CPU, hidratación e INP son medidas distintas.
- Acceso/registro y scanner de lectura diferidos; carrusel nativo, reproductor tras activación. Reservas publicitarias y sticky preservan IDs. Las trazas describen scripting/main thread y fronteras cliente; no acreditan tiempo React exclusivo de hidratación.

## Core Web Vitals de campo

CrUX del Home público, ventana 17-09–14-10-2026, `This URL`, p75, `Many samples` sin conteo numérico. [Consulta oficial](https://pagespeed.web.dev/analysis/https-www-noticiascol-com/x8x9htvanh?form_factor=mobile).

| Métrica | Móvil | Escritorio | Objetivo p75 |
|---|---:|---:|---:|
| LCP | 1,7 s | 1,7 s | ≤2,5 s |
| INP | 195 ms | 104 ms | ≤200 ms |
| CLS | 0,08 | 0,09 | ≤0,1 |

Son valores históricos de producción, no de esta rama ni V2. Lighthouse/TBT no sustituyen usuarios reales/INP. No existe muestra V2; fijar ventana/muestra suficiente y medir variante con el dataLayer existente. CrUX por URL compartida no distingue cohortes. El A/B continúa desactivado.

## Reproducción

Usar producción local, conservar commit/contenido/entorno y repetir cinco pares por dispositivo/variante con el mismo consentimiento y terceros. No purgar producción para medir. Los scripts reciben rutas de salida explícitas fuera de Git:

```bash
npm exec --yes --package=lighthouse@13.5.0 -- node scripts/home-v2/lighthouse.mjs http://localhost:3212/ /tmp/home-v2-lighthouse
node scripts/home-v2/summarize.mjs /tmp/home-v2-lighthouse /tmp/home-v2-summary.json REVISION VARIANTE
```

Para validar productor/lectura usar los opt-ins locales de [analítica](analytics.md); una corrida sin ellos no certifica su coste. Registrar mediana/rango, LCP/nodo, TBT/CLS, JS/CSS, solicitudes y operaciones WordPress de servidor/navegador, imágenes, anuncios, HIT/MISS y trazas con interacciones. Los resultados originales quedan fuera del PR; este informe conserva baseline, comparación, regresiones y límites exigidos.
