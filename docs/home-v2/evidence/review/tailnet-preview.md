# Corrección de la vista previa móvil por Tailscale

La vista inicial devolvía HTTP 200, pero WebKit terminaba mostrando «¡Algo salió mal!». `/api/opinion/authors` devolvía 401 y el fetcher compartido aceptaba el objeto de error como si fuera una lista; `authors.slice` derribaba V2. El control también consumía esa lista sin validar.

Se corrige únicamente `useOpinionAuthors`: los estados HTTP fallidos y payloads que no son listas entran en el canal `error` de SWR; los consumidores conservan un array utilizable y las listas válidas/IDs no cambian. No se cambia el endpoint, proxy, autorización, consultas, anuncios ni tracking.

La vista previa usa ahora HTTPS privado de Tailscale en el puerto 10000, con backend loopback y servicio macOS independiente de la sesión. Se conservan las tres rutas Serve anteriores. No se usa Funnel ni se despliega o activa el A/B. La URL concreta y logs operativos quedan en la evidencia local, fuera del repositorio.

## Comprobación

- RED: cuatro fallos esperados (401/503 y objetos/null) y un caso válido pasando antes del cambio.
- GREEN: 161 suites, 794 unitarias, 15 snapshots; lint, tipos y build pasan.
- WebKit, 390×844, HTTPS real: autores 200, `sec-fetch-site: same-origin`, una columna recibida y 58 tarjetas; cero pantallas de error.
- Respuesta 401 simulada: V2 conserva 57 tarjetas y el control conserva su portada, sin pantalla de error. No se fabrica una respuesta autorizada ni se debilita el proxy.
- Persiste un error externo no fatal del SDK OneSignal, que solo permite su origen de producción; no se presenta como consola sin errores ni se modifica su cuenta para la vista previa.

[Resultados y hashes](tailnet-preview.json). Las 160 corridas Lighthouse anteriores siguen vinculadas a `6601bb1`; no se presentan como una medición de este ajuste. La recepción remota/consentimiento/cohortes y los demás pendientes del Goal conservan su estado.
