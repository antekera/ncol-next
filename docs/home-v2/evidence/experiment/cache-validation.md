# Preparación del aislamiento de caché A/B

Estado: protocolo pendiente de implementación/prueba, **A/B público apagado**. [Fuentes locales y hashes](cache-source-review.json). No se cambió infraestructura, política de consentimiento ni entorno desplegado.

## Arquitectura comprobada localmente

`sst.config.ts` usa `sst.aws.Nextjs` sobre AWS y no sobrescribe `cachePolicy`; invalida `/*` y espera al desplegar. La copia local de la plataforma crea una política SSR con TTL mínimo y predeterminado cero, máximo de un año, cookies fuera de la clave y `x-open-next-cache-key` como header de clave. La política de petición de origen referenciada es `Managed-AllViewerExceptHostHeader`. Son valores del código local, **no una lectura del estado desplegado**. El código selecciona OpenNext 3.9.14 para Next 15+ salvo override; debe verificarse el artefacto realmente desplegado antes de certificar compatibilidad.

El control mantiene ISR; V2 local renderiza documento dinámico y conserva una caché editorial explícita de una hora por configuración/secciones/tags. Un header local `private/no-store` prueba solo la respuesta Next local. CloudFront puede ignorar esas directivas durante un TTL mínimo positivo: [documentación AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cache-key-understand-cache-policy.html).

## Decisión que debe implementar la fase 10

Con el flag ausente/false, conservar control y caché actual sin asignar cohortes ni emitir exposición experimental. Con distribución autorizada, el documento Home de **ambos grupos** debe impedir reutilización entre cohortes, incluso la respuesta control; conservar cachés editoriales y rutas internas. No basta una cookie que no participa en la clave CDN ni un `Vary` asumido. El permiso de persistencia debe proceder de la política existente confirmada; no de cookies GA ni de fixtures locales.

Antes de distribuir, comprobar que la petición llega a la decisión experimental y no recibe un control antiguo desde CDN. La activación y el rollback deben invalidar el Home y esperar la propagación; modificar solo el flag en el origen no demuestra que desaparecieran respuestas cacheadas. OpenNext distingue middleware interno/externo y caché incremental; no se deduce el orden real de su ejecución desde `next start`. [Middleware](https://opennext.js.org/aws/inner_workings/components/middleware), [caché](https://opennext.js.org/aws/inner_workings/cache_interception).

## Evidencia requerida en un entorno aislado

1. Registrar versiones efectivas SST/OpenNext/Next, comportamiento de `/`, política cache/origin request y TTL mínimo efectivos; sanear IDs privados. No obtenerlos por conjetura desde la copia local.
2. Flag apagado: solicitudes repetidas con/sin asignación anterior, bots, QA y peticiones RSC/prefetch reciben control sin exposición ni escritura de asignación.
3. Distribución de prueba: alternar dos contextos con permisos y cohortes opuestas en la misma URL, en frío/caliente, recarga/SPA/atrás y concurrencia. Comprobar HTML y RSC, variante efectiva antes de pintar, ausencia de exposición duplicada y aislamiento por navegación. No tratar cookies de ejemplo como consentimiento real.
4. Conservar `Cache-Control`, `Age`, `X-Cache`, `Via` y un identificador saneado de petición por respuesta. Verificar que nunca se reutiliza el documento opuesto; una sola respuesta sin `Age` no basta. Si el TTL mínimo efectivo no respeta la política, corregir únicamente el comportamiento necesario y volver a probar.
5. Confirmar que datos editoriales siguen compartiendo consultas/caché y se actualizan con publicación/edición/revalidación. Verificar aparte categoría/artículo y sus estrategias anteriores.
6. Rollback probado: flag apagado, invalidación completada, ninguna escritura/exposición experimental nueva, control para cohortes previas. Conservar el registro de la ejecución; no activar tráfico público como parte de este protocolo.

Se exige un entorno aislado autorizado para certificar CloudFront; las pruebas locales cubren únicamente la lógica y respuesta local. La documentación actual de [SST Nextjs](https://sst.dev/docs/component/aws/nextjs) se consultó con Context7. No se ha realizado despliegue ni prueba de cohortes públicas.
