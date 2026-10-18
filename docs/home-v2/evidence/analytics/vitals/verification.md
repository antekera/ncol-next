# Web Vitals nativas por navegación: QA local

El adaptador recibe LCP/INP/CLS de `useReportWebVitals` de Next.js y usa exclusivamente `GAEvent`/dataLayer existentes. Una suscripción persistente en layout, callback estable y núcleo de atribución por navegación; no SDK analítico nuevo, observador personalizado, endpoint, cookie, almacenamiento ni identidad de lector. Activación solo en QA local explícito, excluyendo Vercel; A/B público apagado.

El evento `WEB_VITAL` conserva exposición, variante y apertura; distingue ámbito documental, transición suave y BFCache. Repeticiones del mismo valor/productor no emiten; actualizaciones reales tienen revisión/delta. INP puede decrecer. El consumidor futuro debe elegir el último valor por ID y separar ámbitos y entornos. `web_vital_environment: local-qa` impide confundir estas pruebas con RUM de campo. El rol LCP es un enum editorial/publicidad/otro/desconocido; no se exportan elementos, texto ni URL.

## Verificación del núcleo y revisión

Pruebas RED→GREEN para atribución tardía y ciclo real de propietario de página, incluidos remount, contenido tardío, origen documental después de SPA y nueva exposición BFCache simulada. Se prueban valores inválidos/ausentes, URL ajena o demo, privacidad, reset del modelo GTM, duplicados del framework y revisiones INP descendentes. El documento original sobrevive a 300 transiciones.

Una revisión independiente reprodujo un P2: al expulsar una navegación del historial de 50 entradas, una métrica antigua podía enlazarse al Home siguiente. La regresión falló antes del fix y pasa con el límite explícito de expulsión; una muestra sin propietario conservado se descarta. La revisión volvió a ejecutar el repro y aprobó la corrección. Esa aprobación no certifica política pública, RUM de campo ni la aceptación completa del Goal.

El comando enfocado posterior ejecutó 33 pruebas correctas, pero terminó en exit 1 por cobertura global parcial de funciones/branches; no se presenta como gate verde. El gate unitario completo posterior sí pasa, con cobertura requerida.

## Navegador nativo

[Datos locales](native-qa.json): Ocho escenarios Chromium con contextos frescos: control/V2 y 390/1440 px, con V2 fotográfica y tradicional. El test observa el dataLayer mediante un binding exclusivo del harness, sin transporte de producto. Interacción real de búsqueda antes del clic de noticia, navegación SPA hasta artículo y navegación documental real a `about:blank`: LCP/INP/CLS nativas mantienen el `home_view_id` de origen, sin duplicar ID/revisión. No se dispara un callback de métricas ni un evento de ciclo de vida sintético. Los collectors están bloqueados y el catálogo publicitario usa fixture vacío.

La primera prueba no garantizaba una interacción anterior al abandono y en móvil faltaron métricas de cierre; además buscaba el enlace dentro del h1 de V2, cuyo enlace lo envuelve. Un segundo intento de cerrar búsqueda pulsando su toggle quedaba cubierto por el buscador móvil. El test final usa una interacción no navegante y el enlace editorial real, sin cambiar umbrales ni fabricar métricas. Los intentos anteriores quedan como diagnósticos fallidos, separados de las corridas finales.

No se certifican con este test soft-navigation/BFCache nativos ni otros motores, dispositivos físicos o GA4. Los valores numéricos no son comparaciones Lighthouse ni p75 de usuarios; no deben usarse para aprobar objetivos de campo.

## Rendimiento y limpieza

Unión inicial de assets webpack cache-aware y tamaños físicos comprobados: control 1.518.357→1.525.138 bytes minificados (28→29 JS), V2 1.479.082→1.485.863 (25→26), +6.781 bytes por variante. No equivale a coste de CPU, transferencia HTTP comprimida o regresión CWV medida. El paquete nativo ya existe dentro de Next.js; ninguna dependencia nueva.

Knip conserva los cinco archivos candidatos y 34 registros anteriores (exit 1 por hallazgos, no análisis limpio). No se retiran componentes, dependencias ni estilos. Control y páginas internas permanecen protegidos; la limpieza posterior al experimento conserva el inventario vigente.

## Límites y continuación obligatoria

Conectar política pública real y consentimiento tardío/revocado, preparar cohortes/caché sin activación, mapping en GTM existente y Preview/GA4 DebugView. Separar revisiones y ámbitos en agregación, medir cobertura/ventana/muestra por dispositivo y variante; solo entonces validar LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 en p75 de campo. Continúan pendientes matriz final de laboratorio, causa o justificación explícita de LCP tradicional corto, Dailymotion con Player ID propio, revisión de cierre y PR. El Goal sigue activo.

[Hashes y evidencia estructurada](diagnostic.json). [Contrato central](../../../analytics.md#web-vitals-nativas-adaptación-local-al-datalayer-existente).

## Reproducción del QA

Node 24.19.0. Usar los mismos flags locales tanto al compilar como al arrancar: los HTML prerenderizados conservan los flags del build. Solo reiniciar el servidor con permiso de lectura nuevo deja artículos directos y control estático sin el permiso, aunque el Home dinámico sí lo tenga. El diagnóstico lo comprobó con `body[data-home-reading-qa]`: `granted` en Home dinámico, ausente en artículo directo. Se reconstruyó el QA; no se modificó la política de producto para que pasaran los tests.

```sh
env VERCEL= VERCEL_ENV= HOME_V2_PREVIEW_ENABLED=true HOME_V2_PERFORMANCE_AUDIT=true HOME_V2_READING_QA_CONSENT=granted HOME_V2_BUNDLE_STATS=true pnpm run build
env VERCEL= VERCEL_ENV= HOME_V2_PREVIEW_ENABLED=true HOME_V2_PERFORMANCE_AUDIT=true HOME_V2_READING_QA_CONSENT=granted pnpm exec next start -p 3212
env E2E_BASE_URL=http://localhost:3212 HOME_V2_MEASUREMENT_E2E=true pnpm exec playwright test e2e/home-v2-vitals.spec.ts --project=chromium --workers=1 --retries=0 --reporter=json
```

Guardar salidas/reportes en directorios únicos por corrida. Para la regresión de lectura, video, anuncios y acceso se requieren además los opt-ins E2E propios de esos specs. No confundir un spec omitido por flags con uno aprobado. El ajuste de encuadre del test de ranking vuelve a llevar el módulo lazy al viewport hasta que carga: las imágenes anteriores podían desplazar el placeholder tras el primer scroll. No relaja la regla de visibilidad ni modifica el producto.

Una corrida amplia con permisos ya consistentes terminó con 128 aprobadas/9 omitidas y un fallo en «Crear cuenta» en Firefox 390 px. El aislamiento posterior pasó sus cuatro perfiles. La traza del fallo registra el clic en `(259,733)` tras dos esperas por inestabilidad; el botón aparece después más abajo al cambiar el estado del widget externo. Se cambia esa comprobación a foco + Enter nativos, igual que la apertura de acceso: sigue verificando carga diferida, cancelación, registro, Escape y foco. No se fuerza un handler ni se omite el formulario. El desplazamiento del widget externo queda como riesgo de rendimiento separado; no se modifica auth/seguridad ni se afirma corregido su CLS. La corrida final se registra aparte.

La revisión independiente de los ajustes E2E no encontró defectos accionables: las impresiones siguen exigiendo exposición real y la prueba nativa conserva las tres métricas. La comprobación de registro ahora cubre teclado; no prueba activación por puntero de ese botón. No se presenta ese cambio como una corrección del layout del widget.

## Gates finales

- Unitarias: 158 suites, 765 pruebas y 15 snapshots, exit 0. Lint, TypeScript y build con permiso QA consistente: exit 0.
- Fotográfica/control y páginas internas: 129 E2E aprobadas y 9 omisiones explícitas en tres motores, sin reintentos.
- Métricas nativas fotográfica/control: 4 Chromium aprobadas, reporte JSON con muestras; cero callbacks simulados.
- Tradicional/video y métricas nativas: 33 aprobadas y 12 omisiones explícitas, sin reintentos. Los cuatro escenarios nativos comprueban tratamiento `traditional` en V2 y `current` en control.
- Total de la matriz final: 166 ejecuciones aprobadas y 21 omitidas. Las omisiones son capacidades/configuración explícitas: gestos CDP fuera de Chromium, muestra de lectura temporizada fuera de Chromium, prueba nativa restringida a Chromium y tres casos de build normal sin flags que requieren otro build. No equivalen a casos aprobados.
- Knip: exit 1 con los mismos cinco candidatos y 34 registros; ningún borrado adicional.

Los intentos fallidos de configuración/encuadre se conservan por separado. Los hashes de fuente y logs del diagnóstico corresponden al estado final; no se usan las corridas fallidas como gates. El servidor local de este corte queda detenido. No hubo publicación GTM, despliegue ni activación del A/B.
