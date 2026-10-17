# Estado de ejecución de Home V2

17 de octubre de 2026. Goal activo en `feat/home-v2-plan`; experimento sin activar, sin cambios en rutas o componentes públicos.

## Evidencia alcanzada

- Requisitos y 12 fases documentados antes de modificar código.
- Auditoría de implementación analítica, recurso publicado GTM v32 y propiedad GA4 en lectura. El contenedor necesita ampliar variables/parámetros y triggers; no se ha publicado una integración nueva.
- Build del control en Node 24 y baseline de 20 corridas Lighthouse (5 por dispositivo/caché), red de navegador, bundles transferidos y consulta SSR tras invalidación local.
- Knip inicial contrastado con uso real: plugins CSS preservados; no hay archivos ni dependencias eliminados.
- Capa de datos V2 aislada: configuración de ocho módulos, orden/deduplicación editorial, portada determinista y fallback sin foto; taxonomías paginadas con índice de descendientes y protección frente a ciclos.
- Clientes modulares existentes ampliados: una petición de taxonomías y una GraphQL con aliases para los ocho módulos; sin cuerpos de artículos ni información personal. Prueba contra WordPress real: 12 regiones, ocho módulos completos y cero errores. [Resultado](evidence/editorial-live-smoke.json).
- Caché de datos explícita de una hora, compartida por render y con tags de revalidación existentes. Las nuevas consultas evitan la caché interna semanal que haría ineficaz ese TTL. Los resultados parciales se pueden presentar sin conservar el fallo durante una hora.

La prueba de datos real midió aproximadamente 3 s en frío para reunir ocho módulos, incluyendo taxonomías y procesamiento. **No es una mejora de LCP ni una comparación directa con la portada actual:** faltan composición/streaming, módulos especializados y perfil completo de V2.

## Verificación de esta etapa

- `npm run test:unit -- --runInBand`: **128 suites, 582 tests, 15 snapshots pasan** (24 tests nuevos).
- `npm run lint`: pasa sin errores ni warnings tras excluir las copias de trabajo generadas.
- `npm run ts:compile`: pasa.
- `npm run build`: pasa en Node 24.19.0; conserva avisos existentes de Sentry y CSS. El archivo SEO regenerado se restaura fuera del cambio.
- HAR móvil/escritorio saneados, enlaces locales y 20 resultados Lighthouse comprobados; `node --check scripts/home-v2/lighthouse.mjs` pasa. El runner extraído todavía debe ejecutarse contra V2.
- Prueba real de la capa editorial contra WordPress: dos POST, ocho módulos y cero errores. Esto no prueba todavía el comportamiento completo de Home V2.

## Decisiones de implementación y límites

- Se continúa en la rama solicitada, sin crear otra copia del proyecto. Se comprobó que los servidores existentes en 3000/3100 pertenecían a otros proyectos y se usó exclusivamente 3212 para el control.
- La orquestación pura está en `loadHomeV2Data.ts`, separada de `getHomeV2Data.ts` para probar flujos reales sin depender del runtime de caché de Next. El contrato editorial no cambia por esta separación.
- Se reutiliza `canonicalPath` para identidad por URI; las posiciones son editoriales, no posiciones CSS.
- El modelo de tarjeta incluye solo campos que realmente devuelve la consulta, sin exigir cuerpo, paginación o propiedades de presentación de los tipos antiguos. El control conserva sus tipos y consumidores.
- Se corrigió la referencia obsoleta de Prettier a un `tailwind.config.js` inexistente, usando el stylesheet Tailwind v4 actual. ESLint excluye únicamente workspaces generados `.superpowers/` y `.kilo/worktrees/`; no se desactivaron reglas de aplicación.
- Campo: PageSpeed responde 429; no hay muestra V2 porque el A/B permanece apagado. No se certifica p75 desde Lighthouse.
- Consentimiento: la sesión de auditoría local observó estados `implicit: true` en GTM, sin un default/update explícito. Está pendiente identificar el gestor/política existente; no se añade una CMP por inferencia.
- Las variables nuevas aún no llegan a GA4: el contenedor actual solo transmite parámetros antiguos. Las pruebas locales futuras no sustituirán la validación remota del mapping.

## Próximo trabajo requerido

1. Componentes editoriales de servidor y apertura fotográfica/tradicional basadas en la referencia, con islas cliente pequeñas.
2. Módulos de últimas publicaciones, videos, opinión, BCV, servicios y sidebar/publicidad; completar sus datos sin solicitudes redundantes.
3. Filtro regional con consulta bajo demanda cacheada, pruebas de cambio/retorno y deduplicación de impresiones.
4. Instrumentación en la utilidad dataLayer existente, visibilidad, segunda noticia y lectura en destino; mapping preparado para GTM existente y política de consentimiento confirmada.
5. Preview de QA y asignación A/B estable con separación de caché, apagada por defecto; no distribuir tráfico real.
6. Perfil comparativo de V2, corrección de regresiones, auditoría final de limpieza, pruebas visuales/E2E y PR.

La capa de datos inicial no completa las fases 3–12 ni los criterios de aceptación. Los detalles y comandos quedan en el plan y en los informes; no cerrar el Goal con estos resultados parciales.
