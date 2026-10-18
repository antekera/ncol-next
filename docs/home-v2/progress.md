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
| Protección de errores de autores | [useOpinionAuthors](../../src/lib/hooks/data/useOpinionAuthors.ts) |

## Estado verificable

161 suites, 794 unitarias, 15 snapshots; lint/tipos/build pasan. La matriz anterior al guard del hook de autores tiene 148 E2E aprobados y dos omisiones cronometradas explícitas; el guard posterior se verifica además en WebKit móvil con autores reales/401 simulado en V2/control. La vista previa usa HTTPS privado por Tailscale y un proceso independiente de la sesión.

[Analítica](analytics.md): transporte existente, contexto editorial, visibilidad/deduplicación y validación. [Rendimiento](performance.md): baseline, 160 corridas vinculadas a `6601bb1`, cuatro alertas justificadas localmente y campo histórico separado. [Código muerto](dead-code-audit.md): dos consultas huérfanas retiradas, cero dependencias, compatibilidad y limpieza posterior.

**Goal sin completar y A/B apagado.** Pendientes: señal/política real de consentimiento y persistencia; selector/cohortes públicos todavía no implementados; recepción/deduplicación GTM/GA4; Player ID de Dailymotion y pruebas posteriores de caché/rollback desplegados. La preferencia móvil opcional conserva todas las secciones. [Doce fases y aceptación](acceptance.md), [Goal](GOAL.md), [plan](../superpowers/plans/2026-10-17-home-v2.md).
