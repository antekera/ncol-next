# Destino, segunda noticia y engagement: evidencia local

Código `e28a3c7` en `feat/home-v2-plan`, continuación de `b4b4539`. QA local con permiso explícito; experimento público apagado. No se modificaron GTM ni GA4, ni se añadió otro transporte analítico.

## Contrato comprobado

- El gesto existente de Home entrega sincrónicamente URI pública y contexto editorial al runtime opcional. Conserva un único `CLICK_EVENT` y las convenciones heredadas. Las consultas, fragmentos, credenciales y propiedades no permitidas no se persisten.
- `ARTICLE_DESTINATION_OPEN` usa artículo realmente visible durante un segundo; `SECOND_ARTICLE_OPEN` exige dos artículos distintos; `ARTICLE_ENGAGEMENT` exige 30 s acumulados de cuerpo visible y ventana enfocada. Todos pasan por `GAEvent` y su limpieza de campos del dataLayer.
- `PostHeader` identifica el titular y `PostBody` sus fragmentos. El anuncio y la recomendación intercalados no constituyen lectura. Los artículos anidados no se atribuyen al padre, y un artículo precargado sin intersección no abre.
- La geometría compartida descuenta oclusión y clipping. El nuevo marcador de `HeaderShare` cubre su cabecera fija real. Para párrafos largos se admite el menor de 50 % del bloque y 80 px de su ancho, descubierto.
- La sesión editorial guarda por separado contexto y tiempo de cada artículo. Web Locks serializa el estado entre pestañas; los orígenes pendientes se escriben antes de navegar. Recargar, alternar pestañas o abrir simultáneamente la segunda noticia no repite el evento correspondiente.
- Antes del permiso no se persiste ni emite lectura. La revocación borra el estado y cancela trabajo pendiente. Fallos de almacenamiento conservan la deduplicación ya disponible en memoria; sin storage/bloqueo se limita la cobertura al documento. Sin IntersectionObserver no se simulan exposiciones.

## Pruebas

Runtime Node **24.19.0**, build de producción local con `HOME_V2_PREVIEW_ENABLED=true`, `HOME_V2_PERFORMANCE_AUDIT=true`, `HOME_V2_READING_QA_CONSENT=granted`, `VERCEL`/`VERCEL_ENV` vacíos. Base URL `http://localhost:3212`. Los collectors analíticos externos y la consulta de publicidad se sustituyen en las pruebas de navegador; se ejercitan los componentes y navegación reales. No son visitas de tráfico público.

| Gate | Resultado |
| --- | --- |
| `pnpm run test:unit --runInBand` | 150 suites, 721 tests, 15 snapshots; salida 0 |
| `pnpm run lint` | Salida 0 |
| Build local de producción | Salida 0 |
| Clic Home V2 → destino → segunda pestaña → recarga | 6 casos, 390/1440 px × Chromium/Firefox/WebKit |
| Primera noticia abierta directamente en nueva pestaña | 3 casos; botón medio en Chromium/Firefox, fixture `target=_blank` y clic normal en WebKit |
| Cuerpo enfocado 30 s y revocación | 1 caso Chromium, 390 px; variantes temporizadas Firefox/WebKit omitidas explícitamente |
| Regresión de analítica Home existente | 18 casos, los tres motores; control/V2, filtros, ranking, servicios y «Ver más» |

Los tests de destino cubren origen/módulo/variante/ID, ausencia de segunda apertura antes de ver otro artículo y recarga sin duplicados. El caso temporizado usa el control (`opening_treatment=current`); los casos V2 usan apertura fotográfica. El tratamiento tradicional de lectura comparte el contrato probado unitariamente; no se ejecutó otra matriz tradicional de navegador en esta etapa.

Pruebas unitarias adicionales: 30 min de inactividad, alias y deduplicación por ID, cuerpo/titular sin intersección, foco/ocultación, overlay, contenido editorial por streaming, sesión concurrente, pérdida de storage durante la visita, fallo del bloqueo antes/después de ejecutar, entrega a una pestaña nueva, revocación antes de resolver el bloqueo y limpieza de propiedades. Una prueba RED mostró que el contexto de B sustituía al de A al alternar pestañas; ahora se conservan contextos/tiempos por artículo. Otra prueba RED detectó que no se observaba el cuerpo añadido después del titular; la reconciliación ahora incorpora los targets tardíos.

La primera corrida adicional falló en la entrada de botón medio de WebKit: no creó otra página. Se ajustó únicamente la fixture a un enlace `target=_blank`, conservando su navegación nativa y el handler real; no se implementó un mecanismo de tracking distinto. La snapshot de `PostBody` añade únicamente el marcador editorial. La actualización enfocada de esa snapshot no cumplía por sí sola el umbral global de cobertura; la suite completa posterior sí pasa.

Logs completos locales en `.superpowers/sdd/2026-10-17-home-v2/`: `reading-unit-final.log`, `reading-lint-final.log`, `reading-build-final.log`, `reading-e2e-final.log` y `reading-first-tab-and-legacy-final.log`. Artefactos de build saneados: [tamaños y hashes](reading-build.json). No se agregan trazas o capturas crudas a Git.

## Límites de aceptación

La autorización es exclusivamente una fixture local, no una política nueva de consentimiento. Antes de activar tráfico deben conectarse y probarse la política vigente, el mapping del GTM existente y DebugView. La ventana editorial de 30 min no se identifica como sesión GA4 hasta confirmar su configuración. No hay identificador de lector nuevo. La revocación por atributo está probada en el documento local; la propagación del consentimiento real entre pestañas queda para la integración de la política existente.

No se acreditan p75 de campo, ingresos, viewability publicitaria ni rendimiento global con estos tests. Sigue pendiente perfilar la lectura en artículos largos y completar la matriz Lighthouse/CWV, los módulos especializados del control, video, el selector A/B apagado, la limpieza de cierre y PR. El Goal continúa activo.
