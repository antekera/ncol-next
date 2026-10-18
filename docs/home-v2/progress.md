# Home V2: guía de revisión y estado

Rama `feat/home-v2-plan`; [PR #315](https://github.com/antekera/ncol-next/pull/315), en borrador. Se retiraron del diff los adjuntos de diagnóstico y se conserva la documentación solicitada en informes consolidados.

## Dónde está el código

| Área | Entrada principal |
|---|---|
| Composición editorial y módulos | [HomeV2](../../src/components/HomeV2/index.tsx) |
| Dos aperturas y tarjetas | [Opening](../../src/components/HomeV2/Opening.tsx), [ArticleCard](../../src/components/HomeV2/ArticleCard.tsx) |
| Datos, consultas compartidas y caché | [getHomeV2Data](../../src/lib/homeV2/getHomeV2Data.ts), [configuración](../../src/lib/homeV2/sections.ts) |
| Vista previa | [page](../../src/app/home-v2-preview/page.tsx) |
| dataLayer y visibilidad | [pageMeasurement](../../src/lib/homeV2/pageMeasurement.ts), [domMeasurement](../../src/lib/homeV2/domMeasurement.ts) |
| Lectura y origen antes de navegar | [browserReadingOrigin](../../src/lib/homeV2/browserReadingOrigin.ts), [template](../../src/app/template.tsx) |
| Carrusel compartido con el Home actual | [VideoCarousel](../../src/components/VideoCarousel/index.tsx), [VideoCard](../../src/components/VideoCard/index.tsx) |
| Protección de errores de autores | [useOpinionAuthors](../../src/lib/hooks/data/useOpinionAuthors.ts) |

## Estado verificable

163 suites, 847 unitarias, 15 snapshots; lint/tipos/build pasan. La matriz anterior al guard del hook de autores tiene 148 E2E aprobados y dos omisiones cronometradas explícitas; el guard posterior se verifica además en WebKit móvil con autores reales/401 simulado en V2/control. La vista previa usa HTTPS privado por Tailscale y un proceso independiente de la sesión.

[Analítica](analytics.md): transporte existente, contexto editorial, visibilidad/deduplicación y validación. [Rendimiento](performance.md): baseline, 160 corridas vinculadas a `6601bb1`, cuatro alertas justificadas localmente y campo histórico separado. [Código muerto](dead-code-audit.md): dos consultas huérfanas y el carrusel duplicado de V2 retirados, cero dependencias, compatibilidad y limpieza posterior.

**Goal sin completar y A/B apagado.** Pendientes: señal/política real de consentimiento y persistencia; selector/cohortes públicos todavía no implementados; recepción/deduplicación GTM/GA4; Player ID de Dailymotion y pruebas posteriores de caché/rollback desplegados. La preferencia móvil opcional conserva todas las secciones. [Doce fases y aceptación](acceptance.md), [Goal](GOAL.md), [plan](../superpowers/plans/2026-10-17-home-v2.md).

Publicidad: Home V2 conserva `header`, `popup` y `sticky-bottom` del layout, `sidebar` en su lateral y `article-top` debajo de la apertura. El slot `footer` se sitúa entre «Videos recientes» y Deportes en V2; control e internas conservan su ubicación global. Todos usan `NcolAdSlot` y la selección compartida de campañas/fallback AdSense; IDs, tracking y flags existentes se conservan. Pasan 24 casos en tres motores y dos anchos, con imagen/HTML/AdSense configurado, sin slots ni consultas duplicados. El llenado real de Google no se simula como aprobación de cuenta/inventario.

Videos: V2 reutiliza el carrusel oscuro y las tarjetas del Home actual, con datos editoriales de servidor, posición 6 y márgenes/centrado adaptados a su columna. Se retiró la implementación duplicada. Verificación final: 62 E2E aprobados sin reintentos (V2/control, opinión y tamaños de imagen) en Chromium/Firefox/WebKit; cuatro omisiones explícitas porque el gesto táctil CDP solo existe en Chromium. Confirma carga diferida sin autoplay, cero consultas cliente `VideoPosts` en V2, una en control y eventos atribuidos sin duplicación. Los fixtures de reproductor no certifican ingestión GA4 ni coste real de terceros.

Ajuste publicitario: en V2 el slot `footer` se muestra entre «Videos recientes» y Deportes, una sola vez; control y páginas internas conservan el banner global. El lateral sin contenido colapsa sin fondo de placeholder, reutilizando el observador de contenido del proveedor; al insertarse una creatividad recupera su reserva. Pasan 24 E2E en tres motores y dos anchos con banner/HTML/AdSense y proveedor vacío→lleno→vacío, además de pruebas de ubicación y ausencia de duplicados. El A/B sigue apagado.

Frescura: el caso de Sucesos se debía a exclusiones entre módulos y snapshots de hasta una hora. Las siete secciones de categoría mantienen ahora el orden reciente de WordPress aunque compartan noticias con la apertura, sin duplicados dentro del módulo. Ventana editorial/regional compartida de 300 s y namespaces v4; sin nuevas consultas por tarjeta ni polling. Verificados los siete leads contra el snapshot real de WordPress, 811 unitarias, caché Next real (hits, invalidación, errores/recuperación y control) y 42 E2E de analítica/publicidad sin reintentos; tres casos del guard de build normal se omiten expresamente en el servidor QA. Ver límites SWR en rendimiento.

Vigencia editorial corregida (18/10/2026): se había interpretado erróneamente que toda publicación anterior debía desaparecer. Ahora únicamente caduca una noticia cuando su **título** incluye una fecha ya pasada en Venezuela. Una noticia de ayer sin fecha explícita conserva elegibilidad; fechas futuras y rangos permanecen hasta su último día. Se retiraron restricciones de publicación en consultas WordPress, ranking y regiones. Apertura mantiene categorías/descendientes, marca manual y exclusiones Inameh/dólar. Caché v6 por día para reevaluar títulos, sin polling ni dependencias nuevas.

Las pruebas distinguen fecha del título y fecha de publicación, incluidos títulos vencidos publicados hoy, noticias antiguas sin fecha, rangos, año nuevo, estado tras caché y opinión/regiones. El Goal y A/B siguen pendientes; las mediciones Lighthouse históricas no se atribuyen a esta corrección. Diagnósticos fuera de Git.

Validación de la corrección: 847 unitarias/15 snapshots, lint, tipos, build y caché Next real pasan; 42 E2E de analítica y anuncios en tres motores sin reintentos (tres guardas de build normal omitidas explícitamente en QA). Casos adicionales cubren rangos abreviados, fechas numéricas, cambio de año y publicación/URI de otro año que no afectan a un título vigente. La revisión detectó dos formatos ausentes, corregidos con regresiones; sin bloqueos posteriores. La aprobación de campo, el Goal y A/B permanecen pendientes.

Vista privada HTTPS comprobada a 390/1440 px: Deportes muestra cinco noticias, con una publicación del 17/10 conservada el día 18; carrusel con seis videos. Sin desbordamiento horizontal en ambos tamaños.

Contenedor compartido (18/10/2026): se elimina el máximo exclusivo de 1200 px y se reutiliza `Container` para el ancho/centrado de las páginas existentes. Se conservan gutters móviles de 16 px y video a todo el viewport. `sizes` adapta imágenes a columnas y rem. Pasan build/lint/tipos y 60 E2E de imágenes/publicidad en Chromium/Firefox/WebKit, de 320 a 1920 px; comprobación HTTPS adicional de alineación, ampliación de letra 16/18 px, hero y carrusel sin desbordamiento. Diagnósticos fuera de Git; A/B apagado.

Video a todo el contenedor (18/10/2026): en escritorio/tablet el carrusel cruza ambas columnas; el lateral se divide en BCV/ranking arriba y opinión/servicios/anuncio debajo. Se monta una sola instancia de cada módulo y del slot `sidebar`; la reserva/sticky queda acotada al bloque inferior. En móvil se conserva apertura→BCV→noticias/videos→ranking→opinión/servicios/anuncio y video a todo el viewport. Comprobados seis anchos entre 390 y 1920 px, sin desbordamiento. Pasan build/lint/tipos y 54 E2E de reproducción, navegación, dataLayer y anuncios en tres motores, con tres guardas de build normal omitidas explícitamente en QA. A/B apagado.

Destacada manual (18/10/2026): prioridad y excepción de categoría válidas durante 24 horas desde la publicación original; después se aplica selección ordinaria. Fechas WordPress sin offset usan Venezuela; fecha ausente/inválida/futura no concede prioridad. Se reevalúa tras caché editorial v7 sin consultas adicionales y al vencer en pestañas abiertas/reanudadas mediante el temporizador compartido, sin polling. Los otros módulos conservan noticias antiguas sin fecha vencida en el título. Pasan 864 unitarias/15 snapshots, build/lint/tipos y 18 E2E de analítica en tres motores sin reintentos; tres guardas de build normal omitidas explícitamente en QA. Vista privada comprobada a 390/1440 px. A/B apagado; diagnósticos fuera de Git.
