# Home V2: auditoría y eliminación segura de código muerto

Estado: primera pasada estática realizada; verificación por candidato y limpieza de aplicación pendientes. **No se han eliminado archivos ni retirado dependencias.** Se corrigió una referencia de configuración obsoleta verificada, sin modificar estilos o componentes del control. No se ha completado la auditoría de estilos, duplicaciones de lógica o caminos inaccesibles. Ver [Goal](GOAL.md) y fases 1, 4, 9 y 11 del plan.

## Herramienta y alcance inicial

Se utilizó el Knip ya instalado, mediante `npm run find-duplicate-code -- --reporter json`. El nombre del script no significa que detecte todas las duplicaciones de código: Knip analiza referencias/exports/dependencias; la duplicación de lógica requiere revisión adicional.

Configuración existente `knip.ts`: `entry: ['src/app/layout.tsx']`, `project: ['src/**/*.{ts,tsx}']`. Revisar los plugins y entradas efectivas de Next, Storybook, Jest, Playwright, scripts y build antes de decidir cualquier borrado. Los patrones actuales no acreditan cobertura de CSS, scripts externos ni uso dinámico por configuración.

Runtime de esta pasada: Node `v25.9.0`, Next instalado `16.4.0`, Knip `5.88.1`. El proyecto exige Node 24; repetir gates de implementación y mediciones comparativas con Node 24. Esta pasada sirve para inventario, no acredita compatibilidad del build con el runtime requerido.

Evidencia cruda: [JSON inicial](evidence/knip-initial.json) y [stderr](evidence/knip-initial.stderr.txt). La ejecución finaliza con código 1 por hallazgos; no se interpreta como auditoría aprobada. Stderr contiene avisos de deprecación de Sentry, que se registran sin mezclar una migración ajena a este trabajo.

## Candidatos informados, no eliminaciones aprobadas

| Archivo señalado                                    | Clasificación inicial                              | Verificación requerida                                                                                                |
| --------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/alert-dialog.tsx`                | Candidato de componente sin referencias detectadas | Buscar imports directos, barrels, configuración, stories y consumo indirecto; verificar dependencia Radix en conjunto |
| `src/app/actions/getAllCategoriesWithSlug/query.ts` | Candidato, alto cuidado por taxonomías/SEO         | Revisar generación estática, sitemap, categorías y scripts de mantenimiento                                           |
| `src/app/actions/getAllPostsWithSlug/query.ts`      | Candidato, alto cuidado por rutas dinámicas        | Revisar `generateStaticParams`, generación SEO/build y consumo por configuración                                      |
| `src/blocks/content/LeftPosts/index.tsx`            | Candidato heredado                                 | Distinguir `LeftPosts` de `HomeLeftPosts`; buscar imports dinámicos, stories y uso del control                        |
| `src/blocks/content/RightPosts/index.tsx`           | Candidato heredado                                 | Distinguir `RightPosts` de `HomeRightPosts`; comprobar control y categorías                                           |
| `src/lib/hooks/data/useHeroPosts.ts`                | Candidato de hook anterior                         | Revisar reexports, mocks y selección de portada; conservar hasta verificar                                            |
| `src/app/opinion/publicar/[token]/metadata.ts`      | Candidato en ruta dinámica sensible                | Revisar import de metadata y ruta por token; no eliminar por heurística                                               |

El reporte también contiene dependencias/exports/tipos candidatos, dependencias no declaradas e imports no resueltos. Evaluarlos individualmente; un import no resuelto no demuestra que una dependencia sea innecesaria. No borrar en bloque los resultados de `package.json`.

Contraste manual inicial: `src/styles/index.css:1–4` carga `@tailwindcss/typography`, `tailwind-scrollbar`, `@tailwindcss/aspect-ratio` y `tailwindcss-animate` mediante `@plugin`. Knip los lista como candidatos, pero **tienen uso por configuración CSS y deben preservarse**. `alert-dialog.tsx` también está referenciado en un mock global de `jest.setup.ts` y en configuración de cobertura; cualquier eliminación necesita revisar esos consumidores además de producción.

## Código preservado por compatibilidad

| Conjunto                                                                                           | Razón y evidencia                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home actual: `PostHero`, `HomeLeftPosts`, `HomeRightPosts`, hooks, estilos y utilidades asociados  | Grupo de control requerido durante todo el A/B; imports presentes en `src/app/page.tsx`                                                                              |
| `ga.ts`, `GAPageView`, `GAEvent`, `GA_EVENTS`, `DeferredGoogleTagManager`                          | Tracking obligatorio; hay llamadas reales y reexports. Knip señala el reexport de `GAPageView` aunque existen consumidores: revisar grafo, no borrar automáticamente |
| `Sidebar`, `CategoryArticle`, `LazyImage`, `CoverImage`, `SafeImage`, rankings y hooks compartidos | Uso compartido con páginas internas; cobertura de regresión obligatoria                                                                                              |
| `AdSenseBanner`, `NcolAdSlot`, `StickyHeaderAd`, `ads.ts`, fallback/configuración publicitaria     | Carga dinámica/remota y slots; sin cambios a identificadores                                                                                                         |
| `src/app/**`, rutas dinámicas, metadata, feeds/sitemaps, `proxy.ts`, instrumentación               | Entradas implícitas del framework, SSR y build; no dependen de imports explícitos en todos los casos                                                                 |
| Estilos, plugins Tailwind, ESLint, Storybook, Sentry, scripts y workflows                          | Dependencias/configuración pueden resolverse por nombre. El reporte no autoriza su retirada                                                                          |

## Método de verificación por candidato

1. Guardar archivo/export/dependencia, motivo del hallazgo, consumidores, riesgo, evidencia y decisión en este informe.
2. Buscar símbolos, paths, barrels, alias, strings de `import()`, `require`, configuración, CSS, tests/stories, scripts y CI con `rg`. Revisar rutas Next y cargadores por configuración, incluidos consumidores fuera de `src/`.
3. Leer implementaciones equivalentes y llamadas reales. Para estilos, inspeccionar clases dinámicas/variantes y uso móvil/escritorio en **ambos grupos**; una cobertura de una sola ruta no demuestra desuso.
4. Verificar dependencias por uso en producción, build, pruebas, mantenimiento y configuración. Si un reemplazo compartido afecta Home/categorías, escribir regresión antes de consolidar.
5. Si persiste duda, preservar y documentar. Si está demostrado muerto y relacionado con V2, eliminar en cambio pequeño revisable junto a su prueba/evidencia; actualizar lockfile si corresponde.
6. Ejecutar lint, tipos, unitarias, build y E2E del Home control/V2, artículo, categorías, sidebar y servicios; comparar publicidad y eventos. No rebajar coverage, ignorar hallazgos indiscriminadamente ni usar `knip --fix`.

## Dos grupos de limpieza

### Segura durante desarrollo

Solo candidatos inequívocamente muertos tras completar las verificaciones anteriores. Cada eliminación debe adjuntar evidencia de no uso y resultado de pruebas apropiadas. Aún no hay eliminaciones autorizadas por evidencia.

| Archivo eliminado | Dependencia retirada | Duplicación consolidada | Evidencia y pruebas                                              |
| ----------------- | -------------------- | ----------------------- | ---------------------------------------------------------------- |
| Ninguno           | Ninguna              | Ninguna                 | Actualización documental; no se ha cambiado código de aplicación |

### Después del experimento

- Componentes/estilos exclusivos del Home actual: solo si V2 resulta elegido y se autoriza retirar el control.
- Selector/asignación A/B y contexto experimental: retirar o migrar después de preservar la capacidad de interpretar datos históricos.
- Si gana control, auditar los componentes exclusivos de V2 antes de retirarlos; no borrar lo compartido con categorías.
- Revisar hooks y consultas heredadas cuando sus consumidores hayan sido retirados realmente; repetir análisis completo y regresiones.
- Trabajo amplio de dependencias, lint/build o componentes ajenos: preparar alcance separado con motivo, riesgo y pruebas; no incorporarlo por arrastre al PR de Home V2.

## Pruebas realizadas y pendientes

Limpieza de configuración verificada durante la preparación: `.prettierrc.json` apuntaba a un `tailwind.config.js` inexistente, provocando fallo de formateo. Se sustituyó por `tailwindStylesheet: ./src/styles/index.css`, el punto de entrada Tailwind v4 real; el formateador volvió a ejecutarse correctamente sin cambiar el stylesheet. Se excluyeron del lint `.kilo/worktrees/` (copia local ajena sin archivos versionados) y `.superpowers/` (evidencia temporal), igual que el resto de worktrees ya excluidos. No se eliminaron esas carpetas ni se desactivaron reglas sobre `src/`.

- Ejecutada: `npx jest src/lib/utils/__tests__/ga.test.ts --runInBand --coverage=false`: **4 pruebas pasan**. Acredita la utilidad actual, no la futura instrumentación V2 ni la inocuidad de eliminaciones no realizadas.
- Ejecutado: Knip en lectura; reporta candidatos y problemas pendientes. No demuestra ausencia de código muerto ni de regresiones.
- Pendiente antes de limpiar: revisión completa de cada candidato y entradas dinámicas; análisis de CSS, duplicaciones y lógica inaccesible.
- Pendiente después de cada limpieza: lint, tipos, suite unitaria requerida, build y pruebas E2E/visuales de ambas portadas, categorías y páginas internas.

Documentación de Knip consultada mediante Context7: [Next plugin](https://knip.dev/reference/plugins/next), [tratamiento de hallazgos e imports dinámicos](https://knip.dev/guides/handling-issues), [modo producción](https://knip.dev/features/production-mode). No usar modo producción como prueba única: omite herramientas/test/stories necesarios para el proyecto.
