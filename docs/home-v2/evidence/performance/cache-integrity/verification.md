# Caché editorial y recuperación ante errores parciales

La prueba de producción local detectó y corrigió una respuesta GraphQL parcial que se guardaba durante una hora como completa. `BaseClient.post` registraba `errors`, pero entregaba únicamente `data`: Home V2 conservaba las noticias útiles y perdía la señal necesaria para evitar persistir el fallo. La reproducción anterior a la corrección devuelve `p3` tras recuperarse el servidor, cuando debería entregar `p4`. [Resultado RED](red-result.json).

`BaseClient.postResult` conserva datos y estado de integridad; `post` mantiene su contrato anterior para control, anuncios y consumidores compartidos. Los módulos V2 devuelven un resultado explícito, sin otra consulta. La portada conserva titulares parciales, añade el error `modules` y evita persistirlos mediante su protección existente. Una taxonomía parcial se descarta para no construir filtros incompletos. El filtro regional no guarda una respuesta parcial y permite reintentar. Las claves editoriales y regionales pasan a `v3`, conservando TTL/tags y evitando reutilizar entradas anteriores potencialmente incompletas.

## Prueba con el runtime real

[`scripts/home-v2/cache-runtime.mjs`](../../../../../scripts/home-v2/cache-runtime.mjs) crea una copia temporal de `src`, una aplicación Next mínima y su propio `.next`. Usa las dependencias instaladas, los clientes/getters reales, `unstable_cache`, React `cache` y el handler real de `/api/revalidate`. No sustituye la caché por un mock. Dos consumidores de `getHomeV2Data` dentro del mismo render reciben la misma referencia. `force-dynamic` conserva la caché explícita de datos y el documento responde `private/no-store`.

Se ejecuta con Node 24, desde un directorio con el padre de salida existente; la salida final debe ser nueva:

```sh
node scripts/home-v2/cache-runtime.mjs --output .superpowers/sdd/2026-10-17-home-v2/cache-runtime-nueva
```

No copia `.env` ni hereda credenciales: pasa una lista limitada de variables, endpoint WordPress de loopback y secret ficticio local. Ambos servidores usan puertos locales libres y se detienen al terminar. La copia original y sus cachés no se borran. Las guardas rechazan argumentos ausentes, salida dentro de `src` y sobrescritura de evidencia. [Guardas ejecutadas](guards.json).

Los [16 puntos de comprobación](result.json) verifican:

| Escenario | Resultado observado |
| --- | --- |
| Módulos HTTP 503 → recuperación | Se muestra fallback y se reintenta sin esperar una hora ni invalidar de nuevo. |
| Primera respuesta sana, diez módulos | Una consulta de taxonomías y un POST modular; no una petición por componente. |
| Otro consumidor y solicitudes posteriores | Misma referencia dentro del render; cero consultas adicionales en el hit. |
| Cambio de noticia en el servidor simulado | Se conserva el snapshot anterior hasta la invalidación prevista. |
| Invalidación con secret incorrecto | 401 y snapshot anterior intacto. |
| Invalidación `/categoria/nacionales/` | V2 obtiene `p2` con una pareja de consultas; destacado del control sigue en `p1`, según su contrato previo. |
| Invalidación `/` | Control y V2 reciben `p3`; se usan los tags existentes. |
| Taxonomías HTTP 503 o GraphQL parcial | No se cachea una portada válida vacía; recuperación en la siguiente solicitud. |
| Datos de noticias con error de resolver de imagen | Titular `p3` visible y marcado incompleto; siguiente solicitud sana obtiene `p4`. |
| Filtro regional parcial → recuperación → hit | Respuesta fallida no persistida, noticia `r6` recuperada y cero consultas adicionales en el hit. |

La invalidación por categoría no refresca automáticamente el destacado del control: se preserva ese comportamiento. El flujo de publicación debe invalidar `/` cuando afecte la selección de portada. Esta prueba cambia datos del servidor simulado; **no publica ni edita noticias reales**, no ejecuta el webhook de notificaciones y no invalida CloudFront. El protocolo del [entorno desplegado y las cohortes](../../experiment/cache-validation.md) continúa pendiente.

## Regresión y límites

Pasaron **159 suites, 778 pruebas unitarias y 15 snapshots**, lint, TypeScript y build completo. Las dos pruebas nuevas de integridad fallaron antes de la corrección; otra comprueba que consumidores anteriores siguen recibiendo datos parciales. El ensayo aislado omite su comprobación amplia de tipos; no sustituye TypeScript ni el build del proyecto. El RED focalizado también alcanzó el umbral global de cobertura por ejecutar un único archivo; el GREEN focalizado se ejecutó sin cobertura, y la suite completa pasó sus umbrales.

Pasaron **69 E2E**, sin reintentos ni omisiones, en Chromium, Firefox y WebKit: 57 de portada fotográfica/control, navegación real de categoría/artículo, filtro regional, analítica existente y anuncios; 12 del tratamiento tradicional a 390/900/1440 px y titular corto. Son pruebas funcionales, no una nueva comparación Lighthouse ni aprobación visual final de todos los módulos. La matriz de rendimiento anterior y sus seis regresiones tradicionales permanecen identificadas por separado.

Knip conserva **cinco archivos candidatos y 34 registros**; código de salida 1 por los candidatos ya clasificados. No se eliminan archivos, dependencias ni estilos. No se activan A/B ni tracking público. [Manifiesto y hashes](manifest.json). `source` en los JSON de ejecución es el commit padre; `sourceHashes` fija los archivos de la copia de trabajo realmente probada.

No se equiparan contadores del fixture con latencia real de WordPress, capacidad bajo concurrencia, publicación real, comportamiento de CloudFront, caducidad transcurrida de una hora, LCP/INP/CLS ni datos de campo. La medición del rendimiento tradicional y la validación remota siguen abiertas.
