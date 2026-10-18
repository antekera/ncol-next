# Mapping preparado para el GTM existente — sin importar ni publicar

El [borrador completo](home-v2-draft.json) parte del [export oficial v32](base-v32.json), descargado desde la UI autenticada de `GTM-KSDFW3` el 18-10-2026. El workspace 40 mostraba cero cambios antes de la exportación. No se guardó configuración, importó un archivo, creó un contenedor ni publicó una versión. La base tiene 13 tags, 16 triggers, 7 variables propias y 20 integradas; el contador de 27 variables de la UI incluye ambos tipos.

Se conserva `G4-constant` → `G-JJB0ZF28R1`, los tags de anuncios/Clarity, sus pausas, reglas y parámetros. No hay un Google tag nuevo, HTML adicional, emisor de eventos, almacenamiento o identidad de lector. El script es una herramienta local de configuración, sin red ni credenciales; no participa en el bundle Next.js.

## Cambio revisable

| Elemento | Cambio | Parámetros configurados |
| --- | --- | --- |
| `CUSTOM_PAGE_VIEW`, ID 20 | Ampliar la misma etiqueta con contexto Home; conservar sus tres parámetros y trigger | 9 |
| `CLICK_EVENT`, ID 28 | Ampliar la misma etiqueta con contexto, posición, artículo, filtro, servicio y navegación; conservar sus seis parámetros y trigger | 24 |
| `Home V2 - Impressions` | Nuevo tag GA4 **pausado**; `MODULE_IMPRESSION`, `CARD_IMPRESSION` | 15 |
| `Home V2 - Video` | Nuevo tag GA4 **pausado**; `PLAY_VIDEO`, `CLICK_POST_LINK`, `CLICK_VIEW_NEWS` | 16 |
| `Home V2 - Reading` | Nuevo tag GA4 **pausado**; `ARTICLE_DESTINATION_OPEN`, `SECOND_ARTICLE_OPEN`, `ARTICLE_ENGAGEMENT` | 17 |
| `Home V2 - Web Vitals` | Nuevo tag GA4 **pausado**; `WEB_VITAL` | 21 |

Los nuevos tags usan el nombre del evento existente, `{{Event}}`, sin inventar otra taxonomía de GA4. Sus triggers tienen expresiones ancladas, `experiment_id = home_v2` y variante exacta `control|v2`. No incluyen `CUSTOM_PAGE_VIEW` ni `CLICK_EVENT`, evitando un segundo tag para esas mismas acciones. Los labels, categorías y `ACTION` continúan con la convención en mayúsculas del contenedor actual; los campos Home conservan sus nombres tipados.

Resultado: **dos tags modificados, cuatro añadidos, cero eliminados; cuatro triggers y 34 variables nuevas**. Todos los tags/triggers/variables ajenos al cambio se conservan por igualdad estructural. Las variables nuevas son dataLayer v2, sin valores por defecto: no fabrican variante, artículo o cero para una propiedad ausente. El reset de `HOME_MEASUREMENT_KEYS` sigue siendo responsabilidad de la utilidad de aplicación existente y se debe comprobar hasta GTM.

Las cuatro etiquetas nuevas proponen `analytics_storage` en Additional Consent Checks, además de permanecer pausadas. Esta configuración **no demuestra consentimiento explícito ni sustituye una CMP**: antes de despausarlas debe establecerse qué política real aplica y cómo se comunica su estado inicial, tardío y revocado. No se modifica la política de las etiquetas heredadas, ni `send_page_view`, ni el historial/Enhanced Measurement. Las vistas estándar y `CUSTOM_PAGE_VIEW` siguen siendo eventos distintos; no sumar ambos denominadores.

## Reproducir y revisar

Con Node 24, desde la raíz del repositorio:

```sh
node --test scripts/home-v2/gtm-draft.test.mjs
node scripts/home-v2/gtm-draft.mjs docs/home-v2/evidence/analytics/gtm/base-v32.json /tmp/ncol-home-v2-gtm-review.json
```

La salida debe ser una ruta nueva: el generador no sobrescribe archivos. Rechaza otro contenedor, un destino de medición distinto, los tags heredados incompatibles o entidades `Home V2 -` ya presentes. Los IDs nuevos son únicos y todas las referencias de variables resuelven dentro del contenedor.

Para continuar en GTM, usar un workspace exclusivo y **Merge / Overwrite conflicting entities**, nunca el reemplazo completo del contenedor ni renombrar conflictos, que duplicaría los tags heredados. Revisar primero el diff nativo: dos modificados/cuatro tags nuevos/cuatro triggers/34 variables, ninguna eliminación. Si el estado remoto cambió desde v32, volver a exportarlo y revisar los conflictos antes de aplicar. Importar no equivale a publicar. Las etiquetas nuevas seguirán pausadas en el archivo.

La UI mostró un aviso de términos actualizados. No se pulsó Dismiss/Review Terms ni se aceptó un acuerdo. Su resolución y cualquier carga/aplicación del archivo son pasos externos posteriores; este entregable es local. El acceso de lectura al contenedor ya permitió recuperar la base real, sin inferirla desde el script compilado.

## Dimensiones y métricas de GA4

La lectura fresca de la propiedad `325271287` conserva ocho dimensiones personalizadas heredadas y ninguna métrica propia; no se ha registrado ninguna nueva. Preparar dimensiones de evento de baja cardinalidad para `experiment_id`, `home_variant`, `opening_treatment`, `module_id`, `component_type`, `editorial_position`, `item_position`, `section_id`, `region_id`, `service_id`, `visibility_rule`, `video_provider`, `navigation_method`, `web_vital_name`, `web_vital_scope`, `web_vital_environment` y `lcp_element_role`, según dashboards y capacidad disponible.

No registrar `home_view_id`, `article_id`, `origin_article_id`, `first_article_id`, `video_id` ni `web_vital_id` como dimensiones globales de alta cardinalidad. Los IDs y los parámetros no registrados siguen requiriendo verificación en DebugView y una fuente de eventos sin agregación para sus joins. La disponibilidad y configuración de ese acceso/export no están acreditadas aquí; no se crea un almacén ni enlace facturable nuevo.

La validación debe comprobar los límites de longitud: GA4 admite por defecto 100 caracteres para parámetros de texto generales. El fallback de algunos rankings usa URI como identificador y puede superarlos; no afirmar atribución por artículo completa hasta verificar esos valores o corregir su normalización en la aplicación. No truncar un ID silenciosamente en GTM.

## Procedimiento de aceptación remoto pendiente

1. Confirmar política de consentimiento y su integración existente. No usar un supuesto grant ni habilitar Consent Mode/CMP paralelos para conseguir datos. Verificar rechazo, grant tardío, revocación y ausencia de reenvío de exposiciones históricas.
2. Revisar/importar el borrador en workspace aislado cuando corresponda. No publicar. Las nuevas etiquetas pausadas no constituyen una prueba de envío: para Preview se necesita una copia de trabajo explícita con solo las etiquetas bajo prueba habilitadas.
3. Conectar Tag Assistant al build local de QA correcto, excluyendo sus muestras de los reportes de campo y verificando `debug_mode` en DebugView. La asignación pública A/B permanece apagada. El `local-qa` de Web Vitals debe llegar intacto.
4. Recorrer control/V2, aperturas fotográfica/tradicional, 390/1440 px, cambio y retorno de filtros, ranking, opinión, video PLAYING real, carrusel, servicios y Ver más. Comparar cada evento dataLayer con el tag que disparó y la recepción GA4: un único evento semántico, contexto completo y sin herencia de campos tras reset. Dailymotion requiere Player ID propio y validación real aparte.
5. Abrir dos noticias distintas realmente visibles, alias de la misma noticia y otra pestaña. Verificar origen inmutable, segunda noticia única por sesión editorial y 30 segundos de lectura activa; contrastar el timeout con la sesión GA4 real.
6. Comprobar métricas tardías tras SPA y restauración BFCache, y soporte nativo. Para Web Vitals seleccionar el **último valor por ID**, con revisiones firmadas (INP puede bajar), separado por ámbito, variante, tratamiento, dispositivo, ventana y entorno. No calcular p75 con el promedio/suma de revisiones ni con los datos locales. El estado global PAGE_URL puede corresponder ya al artículo: usar el contexto Home explícito.
7. Revisar el request GA4: ninguna propiedad personal, query de búsqueda, texto libre, token o URL privada; parámetros presentes y dentro de límites. No transformar ni recortar payloads para esconder pérdidas. Registrar las dimensiones solo tras esta prueba.
8. Validar retorno e ingresos con las fuentes existentes: el cero previo de `totalAdRevenue` no acredita ingresos nulos ni una integración publicitaria completa. Conservar IDs publicitarios y sus contadores. La profundidad de scroll se mantiene como diagnóstico.

## Métricas y lectura de resultados

CTR por exposición debe unir clic e impresión visible por `(home_view_id, module_id)`; un clic anterior a los 1.000 ms no fabrica una impresión. Publicar el denominador y el tratamiento de esos clics rápidos. Un CTR binario usa exposiciones con al menos un clic entre las exposiciones visibles; si se cuentan todas las acciones, esa tasa puede superar 100 %. No intercambiar ambas definiciones ni afirmar que un ratio simple de eventos agregados acredita el join.

La segunda noticia se compara por sesiones elegibles de cada variante, usando la sesión GA4 vigente y el evento específico, sin sumar alias o precargas. Engagement/retorno se leen en la propiedad existente; el evento de 30 segundos complementa la señal automática. Los p75 de campo necesitan valores finales individuales y muestra suficiente por cohorte/dispositivo. La lectura actual del conector no sustituye esa capacidad ni valida recepción.

## Evidencia de este corte

Siete pruebas CLI pasan contra la base real: conservación, enriquecimiento sin duplicación, pausas/filtros, límites y campos críticos, IDs/referencias, rechazo y no sobrescritura. El generador se probó primero ausente; los guards de destino, CLI y colisiones también fallaron antes de corregirse. Pasan las 158 suites de aplicación (765 pruebas/15 snapshots) y lint. No se repitió build/E2E: no cambió código de aplicación, CSS, imágenes, dependencias ni deploy. El build y la matriz nativa anteriores pertenecen a `854614f`; no son evidencia de ingestión del borrador.

Knip vuelve a los mismos cinco candidatos y 34 registros, exit 1 por hallazgos conocidos. No se retiró código, tag, dependencia ni estilo. El mantenimiento del generador es trabajo offline relacionado con Home V2, no un sistema analítico en ejecución.

Fuentes primarias: [export/import de GTM](https://support.google.com/tagmanager/answer/6106997?hl=en), [Tag y ConsentSetting](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces.tags), [tipos de Parameter](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/Parameter), [límites de eventos GA4](https://support.google.com/analytics/answer/9267744?hl=en) y [Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode). Context7 se consultó antes de usar estas APIs; los detalles del formato export se contrastaron con el archivo real.
