# Home V2: rendimiento

## Lanzamiento directo y caché propuesta (18/10/2026)

El usuario cancela el A/B: una sola Home V2 sustituirá el Home actual en producción. No se necesitan cookies de asignación, cohortes ni dos entradas HTML por experimento. Conservar ISR/HTML compartido en `/`; la preview privada `force-dynamic` no es el modelo de producción. Las comparaciones anteriores con el Home actual siguen siendo línea base de laboratorio; el seguimiento antes/después no demuestra causalidad.

El análisis de código y cabeceras identifica Vercel en producción (`server: Vercel`, Home `x-vercel-cache: HIT`); la descripción antigua de SST/AWS como hosting real queda corregida. No se verificó todavía la versión activa del plugin WordPress ni se consultó facturación actual. La caché editorial/regional V2 actual de 300 s y las invalidaciones explícitas siguen sin cambios en esta revisión.

**Propuesta pendiente de confirmar antes de implementar:**

| Condición | Política editorial propuesta |
|---|---|
| Actividad diurna | Acumular publicaciones y refrescar Home en lotes globales de 30 minutos; diez notas dentro de una ventana comparten lote. No desplazar continuamente el plazo con cada nota. |
| Madrugada, 00:00–06:00 Venezuela | Reutilizar HTML y datos hasta seis horas como respaldo cuando no haya novedades, sin el refresco editorial actual de cinco minutos. Horario e intervalo son propuestas, no valores configurados. |
| Publicación nocturna imprevista | Marcar pendiente y procesar en la ventana ordinaria de 30 minutos, sin esperar al final de las seis horas. |
| Fecha explícita vencida, destacada de 24 h o retirada urgente | Vía controlada independiente de la agrupación ordinaria; probar elegibilidad y HTML/RSC cacheados para no servir una portada inválida ni dejar el cliente esperando indefinidamente. |
| CMS/planificador fallido | Mantener último snapshot válido, pendientes recuperables y reintentos acotados; no cachear un Home vacío como sustituto válido. |

La cola actual del plugin agrupa guardados por artículo durante 60 s, no publicaciones diferentes. Reutilizarla ampliando la agrupación de Home y separar tags: las categorías actualmente también invalidan el snapshot V2. Coordinar TTL de datos y HTML; cambiar solo `revalidate` no impide que `revalidateTag(..., { expire: 0 })` invalide antes. Sin nuevas notas no habrá un lote editorial ordinario; los límites de seguridad y vigencia anteriores siguen siendo excepciones explícitas. [Semántica oficial de revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).

Oportunidades adicionales: cachear respuesta/datos/fotos de Opinión (hoy puede implicar hasta siete llamadas WordPress por petición), cachear taxonomías por separado con invalidación por términos y evaluar GET público cacheable para regiones. Conservar el ranking que ya obtiene HIT de CDN, el optimizador de imágenes con TTL largo y el video sin feed cliente duplicado. No cachear escrituras `/api/track` ni introducir polling editorial por visitante.

**Validación obligatoria:** comparar visitas sostenidas de día/noche con y sin publicaciones, ráfagas de diez notas, publicación nocturna, cambio de franja, medianoche Caracas, vencimiento de destacada, fallo y recuperación del CMS/planificador, concurrencia e invalidación de categoría/artículo sin purga accidental de Home. Medir invocaciones, consultas WP, hits, regeneraciones y transferencia; no equiparar solicitudes HTTP, invocaciones, consultas SQL o unidades facturadas. Comparar laboratorio equivalente y después campo p75 LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 con ventana suficiente. Sin cambios de runtime, purgas, publicación ni nuevos resultados medidos en esta revisión.

## Alcance y protocolo

La línea base inicial corresponde a `873645e` (17-10-2026). La comparación final corresponde a la aplicación `6601bb1`; los cambios posteriores de autores, tipografía en `rem` y restitución del slot `article-top` no se presentan como nuevas mediciones de rendimiento. Antes del lanzamiento se debe repetir la comparación con el inventario publicitario completo. Los diagnósticos intermedios y archivos generados se conservan fuera de Git.

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
- Caché Next real: hits compartidos e invalidación por portada/categoría, recuperación HTTP/GraphQL parcial sin persistir snapshots fallidos; contrato anterior de datos parciales preservado. Flujo de publicación WordPress y CDN desplegado pendiente. El análisis posterior confirma Vercel en producción; las pruebas locales no acreditan su configuración desplegada.
- Optimizador Next existente para imagen crítica y lead tradicional SSR; `sizes` ajustado a nueve anchos, dimensiones reservadas y lazy loading fuera de pantalla. Solo la imagen crítica se prioriza; no se cambia globalmente el bypass CDN heredado de `SafeImage`.
- Foto móvil frío: imágenes 91685 frente a 129669 bytes; 99 frente a 100 solicitudes totales. Escritorio frío: 255531 frente a 221667 bytes (+15,3 %), 16 frente a 13 imágenes. Se acepta expresamente el coste visual inicial adicional; no implica consultas duplicadas. Los recursos varían además por campañas/píxeles de terceros.
- Imágenes calientes: tradicional móvil 32307 frente a 23645 bytes, de los cuales anuncios nativos 32151/23507. Titular corto escritorio 75257/68372, anuncios 75119/68234. Las alertas se documentan por inventario/caché, sin extrapolar ahorro móvil a escritorio ni sumar medianas de subgrupos como mediana total.
- JS propio HTTP móvil frío: 502400 bytes control y 512469 foto (+10069; +2,0 %), dentro de presupuesto. Unión física compilada inicial: control 29 assets/1535364 bytes; V2 26/1496448. Captura síncrona de origen añade 8294 bytes compilados a ambas rutas. Bytes compilados/HTTP, CPU, hidratación e INP son medidas distintas.
- Acceso/registro y scanner de lectura diferidos; carrusel nativo compartido con el control, embeds sin autoplay al acercarse el módulo al viewport (200 px). Reservas publicitarias y sticky preservan IDs. Las trazas describen scripting/main thread y fronteras cliente; no acreditan tiempo React exclusivo de hidratación.

La adaptación del carrusel anterior a V2 recibe `videos.articles` de la consulta editorial de servidor y deshabilita su feed cliente `VideoPosts`; el control conserva su carga habitual. Los E2E registran cero `VideoPosts` cliente en V2 y uno en control, con fixtures de reproductor. Se elimina el carrusel duplicado y su CSS/tamaño de imagen exclusivo. El cambio sustituye miniaturas activadas por iframes diferidos, por lo que puede aumentar recursos de terceros al llegar al módulo: las 160 corridas históricas anteriores no validan este cambio. Repetir la comparación Lighthouse y el coste de terceros antes del lanzamiento; no se declara mejora de CWV por reutilizar código.

El ajuste publicitario posterior elimina el fondo y las reservas CSS permanentes del lateral vacío. `collapseEmpty` es opt-in de V2 y reutiliza el observador de contenido existente; el proveedor conserva su target/IDs y recupera 250/600 px al insertar contenido. El crecimiento de una creatividad tardía puede producir CLS en esa zona: esta decisión responde a retirar el hueco sin anuncio y requiere comparación de rendimiento antes de lanzamiento. No se aplica al control ni se cambian las reservas de AdSense/creatividades renderizadas. El slot `footer` se mueve entre «Videos recientes» y Deportes en la vista previa y QA local, sin duplicarlo; las otras rutas conservan su ubicación. Las mediciones históricas no certifican estos cambios.

Frescura editorial: se reprodujo el caso de Sucesos con noticias del 18/10 ya presentes en WordPress y en la apertura, excluidas del módulo por deduplicación global. Las siete secciones de categoría usan ahora la política existente de repetición entre módulos, conservando unicidad por ID/URI dentro de cada listado y el orden DATE DESC de WordPress. La caché editorial y regional comparte una ventana de 300 s, namespace v4 y los tags existentes. No se añade una consulta por módulo ni polling cliente. La revalidación temporal de Next es stale-while-revalidate: el primer acceso vencido puede recibir el snapshot anterior mientras se actualiza; ante fallo del CMS se preserva la recuperación segura. La vista previa privada no depende de invalidaciones de producción. El cambio incrementa la frecuencia máxima de recomposición compartida respecto a 3.600 s; las mediciones históricas no certifican ese coste ni la nueva distribución editorial.

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

## Vigencia por fecha explícita del título (corrección 18/10/2026)

Se retira la interpretación anterior que limitaba todo a publicaciones del día. WordPress ya no recibe `dateQuery` y el ranking ya no filtra SQL por fecha de la URI. La apertura conserva sus dos selecciones (categorías permitidas y marca explícita, hasta 30 candidatos cada una) en el mismo POST: once aliases para diez módulos, sin consultas por tarjeta. Los módulos recuperan sus noticias recientes aunque se hayan publicado en días anteriores.

La vigencia solo caduca cuando el título contiene fechas explícitas ya pasadas. Se reconocen día/mes en español (con año opcional), ISO `AAAA-MM-DD` y fechas numéricas `DD/MM` o `DD-MM` con año opcional; se ignoran fechas inválidas. Sin año se usa el calendario actual de Venezuela; diciembre/enero resuelve el cruce de año. La fecha de publicación y la URI se ignoran para determinar vigencia. Los rangos abreviados heredan mes/año del primer extremo y resuelven el cruce de mes; un rango permanece hasta su última fecha; una fecha futura no se descarta. No se infiere caducidad de palabras como «hoy» sin fecha explícita.

Namespaces editorial v8/regional v6 y clave por día, TTL 300 s y filtrado de títulos tras caché. La prioridad manual y excepción por categoría caducan 24 horas después de la publicación original, también tras leer caché; el snapshot conserva los slugs permitidos y sus descendientes para aplicar la regla sin nuevas consultas. El límite cliente solicita una respuesta al próximo vencimiento o al cambiar de fecha y revisa pestañas reanudadas; conserva el reinicio regional diario. Un temporizador compartido, sin polling. El ranking vuelve a su ventana de visitas de siete días; V2 solicita hasta 50 filas en la misma consulta ya existente, filtra títulos y muestra las primeras cinco válidas. Control y política de caché del endpoint común se restauran. Opinión filtra títulos y conserva columnas antiguas sin fecha explícita. Videos sigue usando datos de servidor, sin fallback cliente adicional.

Costes: lectura local de títulos acotados a 3.000 caracteres y hasta 50 candidatos ligeros para ranking frente a cinco; sin consultas WordPress extra, dependencias ni transporte analítico nuevos. Las mediciones históricas de Lighthouse no corresponden a este cambio; la comparación final y los p75 de V2 siguen pendientes antes de lanzar.

Contenedor compartido (18/10/2026): Home V2 reutiliza `Container` en lugar del límite exclusivo de 1200 px. Mantiene sus márgenes móviles de 16 px para el carrusel de borde a borde. Las declaraciones `sizes` se calculan con los límites 48/64/80/96 rem del contenedor y sus gutters compartidos, con `min()` para respetar viewport y letra ampliada; se conservan carga diferida y prioridad exclusiva del hero. La prueba de imágenes interpreta comas de funciones CSS y añade anchos 1280/1536/1920. No se atribuyen las corridas Lighthouse históricas a este ajuste de layout.

Validación del contenedor: 60 E2E de imágenes/publicidad pasan en tres motores y doce anchos, con prueba manual adicional a 16/18 px de raíz para alineación/hero/carrusel. Build, lint y tipos pasan; no acredita CWV de campo ni una comparación Lighthouse nueva.

Video de ancho completo (18/10/2026): el mismo `VideoCarousel` ocupa una fila que cruza las dos columnas del contenedor; el sidebar se renderiza en dos partes sin duplicar widgets, solicitudes, IDs ni slots. Se mantienen datos de servidor y carga diferida. El anuncio lateral conserva su integración/reserva y sticky dentro del tramo inferior, posterior al video. El nuevo ancho puede exponer más tarjetas/reproductores por viewport; la comparación Lighthouse y la visibilidad publicitaria de campo anteriores no se atribuyen a esta disposición. Pasan build/lint/tipos, 54 E2E de reproducción/navegación/dataLayer/anuncios (tres guardas de build normal omitidas en QA) y comprobación visual por coordenadas en seis anchos, conservando el flujo móvil.

Apertura con fondo (18/10/2026): `mediaDetails` se solicita solo para los dos aliases de apertura en el mismo POST. Con dimensiones ≥1200 × 600 px se reutiliza el original verificado o un candidato suficiente, servido por el optimizador existente. `sizes` contempla el recorte `cover` y las reservas de 34 rem escritorio/32 rem móvil; evita ampliar miniaturas pequeñas. Prioridad exclusiva de la imagen principal, sin otra descarga para medir dimensiones, dependencias ni transporte analítico. El fallo conserva la reserva inicial y devuelve texto normal. Pasan 63 E2E de la vista previa/control y tratamiento sin imagen; otros 12 prueban la imagen grande real del componente en un entorno Next aislado (390/1440 px, DPR 1–3, tres motores), candidato único y coincidencia de preload. Storybook sigue bloqueado por su incompatibilidad previa de versiones. Esta comprobación de recursos y layout no sustituye Lighthouse comparativo ni CWV de campo; no se atribuyen resultados históricos al nuevo diseño.
