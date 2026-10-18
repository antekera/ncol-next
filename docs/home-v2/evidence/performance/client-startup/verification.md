# Arranque del cliente y acceso bajo demanda

Estado: reducción de código inicial verificada; **rendimiento tradicional pendiente de aprobación**. [Datos y hashes](diagnostic.json). El A/B público continúa apagado.

## Hallazgo y cambio

El chunk al que Lighthouse atribuía unos 1,8 s no contiene solo Sentry. El grafo incluye Next.js, su planificador React y observabilidad; un perfil nativo muestra trabajo descendiente de React bajo ese planificador. Su tiempo inclusivo no es coste exclusivo de Sentry. No se retira el SDK ni se alteran Replay, muestreo o privacidad.

Otro chunk inicial contiene formularios, React Hook Form, Zod y resolvers aunque el diálogo de acceso está cerrado. `LoginModalContext` conserva su API, callbacks y recarga tras éxito, pero monta el formulario con `React.lazy` al solicitar acceso. Mientras llega ofrece un aviso accesible y cancelación. Al cerrar se restablece el modo de acceso; Escape devuelve el foco al botón. El aviso lleva `data-home-occluder`, consumido por la geometría existente. Los formularios y sus dependencias se conservan para acceso, registro y otras rutas.

Unión sin duplicados de assets JS declarados por `main-app`, layout, template y la página correspondiente:

| Entrada | Antes, bytes compilados | Después | Diferencia | Assets JS antes → después |
| --- | ---: | ---: | ---: | ---: |
| Control | 1.654.454 | 1.511.008 | −143.446 | 30 → 28 |
| V2 | 1.617.007 | 1.472.893 | −144.114 (8,9 %) | 28 → 25 |

Son tamaños minificados del build, **sin compresión HTTP**, no solicitudes observadas, bytes de transferencia ni coste de hidratación. El grafo final deja las tres librerías de formularios fuera de esas entradas iniciales. La prueba de navegador comprueba además que el chunk real del diálogo no se solicita hasta abrirlo; localiza su texto público compilado en vez de fijar un ID que cambia en cada build.

## Diagnóstico de latencia y límites

En un único par con titular corto SSR, misma creatividad, Chrome 155.0.8059.80, 412×823/DPR 1,75, CPU ×4 y throttling CDP previamente documentado:

| Muestra | LCP observado | Inicio de campañas | Fin de imagen |
| --- | ---: | ---: | ---: |
| Antes | 8,076 s | 6,162 s | 8,042 s |
| Después del splitting | 7,804 s | 5,922 s | 7,777 s |

No hay significancia estadística ni mejora global aprobada. El sticky sigue siendo el candidato de 32.000 px² y sigue llegando tarde. Este par se capturó antes del atributo de oclusión y de la corrección posterior de foco. El aviso y el diálogo no se montan en estos recorridos; el par no aprueba la latencia del commit final. La reproducción adicional de la utilidad eligió otra creatividad aleatoria: se conserva como comprobación de la herramienta, no como parte del par. No se observaron errores de hidratación en los listeners del diagnóstico. Los tamaños cross-origin sin TAO son `null`.

Queda por reducir o justificar el arranque editorial/publicitario completo, comparar ambas aperturas/control en condiciones equivalentes y validar campo con muestra suficiente. No se confunden estos perfiles CDP con Lighthouse ni con p75 de usuarios reales. Los umbrales LCP ≤2,5 s, INP ≤200 ms y CLS ≤0,1 siguen vigentes.

## Pruebas y reproducción

RED: el provider montaba el formulario cerrado y el navegador descargaba su chunk antes de interactuar. GREEN: carga bajo demanda, cancelación con descarga retenida, registro, Escape, foco y reapertura en control/V2, 390/1440 px y los tres motores. Un segundo RED detectó que faltaba el marcador de oclusión en el aviso; se incorporó al contrato existente. La comprobación adicional de foco falló: el provider abre Radix desde botones externos a DialogTrigger. Ahora conserva en memoria el elemento enfocado y lo restaura después de desmontar, también al cancelar la descarga. Se prueba el recorrido de teclado explícitamente; no se supone que un clic de ratón enfoque botones en todos los navegadores.

Node 24: 151 suites/726 tests/15 snapshots; lint, TypeScript y build verificados. La matriz final pasa **81 E2E sin reintentos**: 12 de acceso, 36 publicitarios, 18 analíticos, 12 de apertura tradicional/fixture y tres de navegación, en Chromium/Firefox/WebKit. Logs: `login-focus-unit-final.log`, `login-focus-lint-final.log`, `login-focus-build-final.log`, `login-complete-types-final.log` y `login-complete-e2e-final.log`; hashes en el JSON. El primer lanzamiento de regresión omitió la expectativa de tratamiento tradicional y el opt-in de navegación; falló por esa configuración, se corrigió y se vuelve a ejecutar sin reintentos. No se presenta ese primer lanzamiento como aprobado.

El build opcional `HOME_V2_BUNDLE_STATS=true pnpm build` recoge únicamente el compilador cliente usando `stats.toJson`, sin sources ni hooks de ejecución. Los JSON completos quedan ignorados en `.superpowers/sdd/2026-10-17-home-v2/bundles`; no se versionan ni se cargan en un servicio externo. No se añade una dependencia de análisis.

Con los flags y servidor tradicional local de la [reproducción previa](../lcp-conditional/verification.md), ejecutar:

```sh
node scripts/home-v2/lcp-headline-probe.mjs /tmp/home-startup-01.json --throttled --cpu-profile --short-only
```

La opción CPU guarda muestras V8 junto al resultado; rechaza sobrescrituras antes de abrir Chrome. Sin `--short-only` compara los dos titulares. No modifica contenido editorial ni crea medición de usuarios. Los perfiles previos se retienen localmente con hashes en el JSON saneado.
