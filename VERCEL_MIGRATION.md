# Migración a Vercel — Roadmap

Documento de trabajo para la migración de `ncol-next` desde SST/AWS hacia Vercel. Sirve como single source of truth durante la ejecución.

> **Estado actual**: planificación completa. Ejecución pendiente de arrancar Fase 0.
> **Autor**: Miguel + Claude (Anthropic).
> **Última actualización**: 2026-08-25.

---

## Índice

1. [Contexto y motivación](#contexto-y-motivación)
2. [Diagnóstico de costos AWS](#diagnóstico-de-costos-aws)
3. [Análisis de caching actual](#análisis-de-caching-actual)
4. [Inventario de recursos SST](#inventario-de-recursos-sst)
5. [Decisiones de arquitectura](#decisiones-de-arquitectura)
6. [Fase 0 — Preflight](#fase-0--preflight)
7. [Fase 1 — Preparación del código](#fase-1--preparación-del-código)
8. [Fase 2 — Setup Vercel + Deploy preview](#fase-2--setup-vercel--deploy-preview)
9. [Fase 3 — QA en preview](#fase-3--qa-en-preview)
10. [Fase 4 — DNS cutover a Vercel](#fase-4--dns-cutover-a-vercel)
11. [Fase 5 — Cleanup AWS + GitHub](#fase-5--cleanup-aws--github)
12. [Fase 6 — Optimización SEO server-side](#fase-6--optimización-seo-server-side)
13. [Anexos](#anexos)

---

## Contexto y motivación

- Sitio hoy: Next.js 16 + WPGraphQL, desplegado en AWS vía SST (OpenNext + CloudFront + Lambda + S3 + DynamoDB + SQS).
- Costos AWS: ~$71/mes proyectado, con crecimiento por el cache thrash de OpenNext en S3.
- Objetivo: migrar el front a Vercel manteniendo control operativo vía GitHub Actions (no acoplarse al Git integration nativo de Vercel para preservar portabilidad futura a otros proveedores).
- Servicios que permanecen en AWS post-migración: `AudioBucket` (Polly TTS), `ncol-images` (WP media pipeline con `cdn.noticiascol.com`).

---

## Diagnóstico de costos AWS

**Últimos 25 días — total $58.98 (proyectado $70.77/mes):**

| Servicio          | Costo  | %     | Driver real                                                     |
| ----------------- | ------ | ----- | --------------------------------------------------------------- |
| AWS Lambda        | $21.62 | 36.7% | 1.6M GB-s SSR + image optimization (OpenNext)                   |
| Amazon S3         | $18.69 | 31.7% | **2.88M Tier1 PUTs** — cache ISR OpenNext (storage solo $1.30)  |
| Amazon CloudFront | $7.67  | 13.0% | Invalidations $2.54 (1,508), KV Store $1.03, CF Functions $1.02 |
| Amazon VPC        | $3.00  | 5.1%  | 1 IP pública ociosa (Elastic IP sin asociar)                    |
| DynamoDB          | $2.52  | 4.3%  | Revalidation table (OpenNext tags)                              |
| EC2 - Other       | $2.19  | 3.7%  | Data transfer inter-servicios                                   |
| SQS               | $1.58  | 2.7%  | Revalidation events queue (OpenNext)                            |
| Route 53          | $1.18  | 2.0%  | Zonas hosteadas                                                 |

**Egress CloudFront:** 9.07 GB en 25 días → tráfico muy cacheable, muy por debajo del cupo de Vercel Pro (1 TB/mes).

**Proyección post-migración (Vercel Pro + AWS residual):**

| Concepto                                | Costo/mes                |
| --------------------------------------- | ------------------------ |
| Vercel Pro                              | $20.00                   |
| S3 `ncol-images` (5 GB storage + reads) | ~$0.15                   |
| S3 `AudioBucket` (234 MB)               | ~$0.10                   |
| CloudFront `cdn.noticiascol.com`        | ~$1-3                    |
| Route53 (si se mantiene)                | $1.18                    |
| Polly (misma que hoy)                   | $0 (dentro de free tier) |
| **Total estimado**                      | **~$22-25/mes**          |

**Ahorro esperado:** ~$45-50/mes + eliminación de superficie operativa (OpenNext, revalidation queue, CloudFront invalidations, KV Store routing).

---

## Análisis de caching actual

### Lo que ya está bien y funciona idéntico en Vercel

| Ruta                                    | ISR (`revalidate`) | Estrategia                                       |
| --------------------------------------- | ------------------ | ------------------------------------------------ |
| `/` (home)                              | 3600s (1h)         | Tags `homepage`, `featured-post`                 |
| `/categoria/[...slug]/`                 | 86400s (24h)       | Tags `category-{slug}`, `today-yesterday-{slug}` |
| `/autor/[slug]/`                        | 86400s (24h)       | ISR estándar                                     |
| `/[posts]/[year]/[month]/[day]/[slug]/` | 31536000s (1 año)  | Tag `post-{path}` + on-demand revalidation ✅    |

- `src/app/actions/fetchAPI.ts` usa `unstable_cache` con tags. Compatible 100% con Vercel.
- `src/app/api/revalidate/route.ts` usa `revalidateTag` + `revalidatePath`. La parte de invalidación CloudFront se remueve; el resto queda intacto.

### Client Components que impactan SEO (Fase 6)

Detectados como `'use client'`:

- **Listados (candidatos a Server Component)**: `HomeLeftPosts`, `HomeRightPosts`, `RecentPosts`, `CategoryPosts`, `TagPosts`, `AuthorPosts`, `MostRecentPostBanner`, `404Posts`.
- **`SinglePost`** (`'use client'` con SWR fallback): **dejar como está**. Está justificado — evita cachear 404 falsos por fallos transitorios de WP.

### Decisión estratégica

**NO refactorizar caching antes de la migración**. Razones:

1. Misma API estándar Next.js funciona idéntica en Vercel y OpenNext.
2. Mezclar dos cambios grandes hace imposible diagnosticar regresiones.
3. Vercel Speed Insights + Analytics darán datos objetivos para priorizar Fase 6.

---

## Inventario de recursos SST

### 🟢 Se elimina con `sst remove` (componente `Nextjs`)

**CloudFront:**

- `ncol-nextCdnDistribution` (`d1c5zxnaklq0s1.cloudfront.net` → `www.noticiascol.com`)
- `ncol-nextCdnRedirectDistribution` (`d39vgduwccyeum.cloudfront.net` → `noticiascol.com` apex→www)
- `ncol-nextServerCachePolicy`
- `ncol-nextKvStore` (KV Store routing SST — $1.03/mes)
- 2 CloudFront Functions

**Lambda:**

- `ncol-nextServerUseast1Function` (SSR)
- `ncol-nextImageOptimizerFunction`
- `ncol-nextRevalidationEventsSubscriberFunction`
- `ncol-nextRevalidationSeederFunction`
- 2 Function URLs, 4 IAM roles

**Storage:**

- `ncol-nextAssetsBucket` — **793,614 objetos, 61 GB** (source del cache thrash)
- `ncol-nextCdnRedirectBucket` — vacío
- 3 CORS configs, 3 bucket policies, 3 public access blocks

**Otros:**

- `ncol-nextRevalidationTable` (DynamoDB)
- `ncol-nextRevalidationEventsQueue` (SQS)
- 4 CloudWatch Log Groups
- Lambda event source mapping SQS↔Lambda

**Route53 (⚠️ CUIDADO — reemplazar ANTES de `sst remove`):**

- `ncol-nextCdnARecord Wwwnoticiascolcom` (A `www.noticiascol.com`)
- `ncol-nextCdnAAAARecord Wwwnoticiascolcom` (AAAA `www.noticiascol.com`)
- `ncol-nextCdnRedirectARecord Noticiascolcom` (A `noticiascol.com`)
- `ncol-nextCdnRedirectAAAARecord Noticiascolcom` (AAAA `noticiascol.com`)

### 🟢 Se mantiene (retain intencional)

- `AudioBucketBucket` (364 mp3s, 234 MB) — con lifecycle 365d, CORS, policy, public access block.
- `AudioSecret` (SSM Parameter Store) — HMAC token para `/api/audio`.

### 🟠 Cleanup manual opcional

- **Elastic IP ociosa** ($3/mes): revisar y liberar.
- **Stacks staging** (`sst remove --stage staging`).
- Buckets bootstrap SST (`sst-asset-*`, `sst-console-*`) — borrables si se abandona SST completamente.
- **`sst-state-*`** — NO borrar hasta 100% seguro de no volver a SST.
- Bootstrap CDK (`cdk-hnb659fds-assets-*`, `cf-templates-*`) — borrables si no hay otros proyectos CDK.

### 🔴 Nunca tocar

- `ncol-images` bucket + CloudFront `cdn.noticiascol.com` — pipeline WP Offload Media.
- Buckets de otros proyectos (`waha-session-*`, `scraper-temp-*`, `ncol-legales-*`, `ncolpublishercdkstack-*`, `ncolemailpublisherstack-*`).

---

## Decisiones de arquitectura

### 1. CI/CD: GitHub Actions con Vercel CLI (Opción B)

**Por qué**: mantener control en GitHub Actions preserva portabilidad futura a otros proveedores. Vercel Git Integration nativo se descarta para reducir coupling.

**Estrategia de branch paralela** durante Fases 2-4:

- `main`: intacto durante la transición → AWS sigue deployando como hoy (workflow SST vigente).
- `vercel-main`: branch nueva creada desde `main` → Vercel deploya desde ahí.
- Hotfix urgente para AWS → PR contra `main` (usa workflow SST).
- Todo lo demás → PR contra `vercel-main` (usa workflow Vercel).
- Post cutover DNS estable (Fase 5) → merge `vercel-main` → `main`, borrar `vercel-main`, `sst remove`.

**Flujo del nuevo workflow (branch `vercel-main`):**

- Push a `vercel-main` → workflow corre lint + tests → `vercel deploy --prod`.
- PR contra `vercel-main` → workflow corre lint + tests → `vercel deploy` (preview URL comentada en PR).

### 2. Runtime: Node.js 24 LTS Fluid Compute, NO Edge

**Por qué**: tráfico mayoritariamente venezolano → sin ventaja del edge global. Fluid Compute reusa instancias, cold starts menores, mismo precio que Edge.

**Node 24 LTS**: default actual en Vercel. Se aprovecha la migración para saltar de Node 20 → Node 24 en todo el stack (local, CI, runtime).

**Config**: `vercel.json` con `regions: ["iad1"]` y `runtime: "nodejs24.x"` explícito en todas las rutas.

### 3. CDN edge (assets estáticos + ISR HTML): activo (default)

**Por qué**: incluido en Pro, sin costo por región. Es lo que hace rápido a Vercel.

### 4. Imágenes: sin cambios

- Editoriales (WP): siguen en `cdn.noticiascol.com` (S3 + CloudFront, independiente).
- Audio (Polly): sigue en `AudioBucket` (S3 en AWS, accedido vía IAM user con access keys).

### 5. Audio en Vercel: IAM user (Opción A) primero, OIDC después

- **Fase 1**: crear IAM user `ncol-vercel-audio` con permisos mínimos (Polly + S3 sobre AudioBucket) y access keys en env vars de Vercel.
- **Fase 6 (hardening opcional)**: migrar a Vercel OIDC → AWS STS AssumeRole.

### 6. DNS: mantener Route53

**Por qué**: minimizar cambios. Solo se actualizan los records A/AAAA para apuntar a Vercel. Zona sigue en AWS.

---

## Fase 0 — Preflight

**Duración estimada**: 1 día. **Riesgo**: Bajo.

### Yo (Claude)

- [ ] Auditar todas las env vars requeridas cruzando `sst.config.ts` + `.github/workflows/deploy.yml` + código.
- [ ] Producir tabla definitiva marcando: nombre, environment (prod/preview/dev), secret vs public, uso.
- [ ] Identificar código AWS-específico que requiere ajuste (invalidación CloudFront en `revalidate/route.ts`, imports SDK, etc.).
- [ ] Verificar que `next.config.mjs` no tenga nada incompatible con Vercel.
- [ ] Generar JSON de política IAM mínima para `ncol-vercel-audio`.
- [ ] Verificar que no exista `export const runtime = 'edge'` en el código.

### Tú (Miguel)

- [ ] Crear cuenta/login en Vercel con GitHub (team `noticiascol`).
- [ ] Confirmar acceso al panel Route53 (`noticiascol.com`).
- [ ] Confirmar acceso al plugin WP Offload Media (por si hay que ajustar URL fallback).
- [ ] Verificar acceso admin al repo `antekera/ncol-next` en GitHub.

**Entregable de fase**: documento con tabla de env vars + JSON de policy + informe de code review.

---

## Fase 1 — Preparación del código

**Duración estimada**: 2 días. **Riesgo**: Bajo.

### PR 1: `chore/vercel-migration-prep`

**Yo (Claude):**

- [ ] **Migrar a Node 24 LTS** (todos los puntos deben ir en el mismo PR para consistencia):
  - `package.json`: `engines.node` → `"24.x"`.
  - `package.json`: `volta.node` → `"24.x.x"` (última LTS).
  - `.github/workflows/deploy.yml`: `node-version: 24`.
  - `CLAUDE.md`: actualizar sección "Environment" a Node 24.
  - Verificar que no hay usos de APIs deprecadas en Node 24 (correr `npm run build` + tests).
  - Confirmar compatibilidad de dependencias críticas: `@sentry/nextjs`, `@aws-sdk/*`, `next`, `drizzle-orm`, `@libsql/client`.
- [ ] Ajustar `src/app/api/revalidate/route.ts`:
  - Hacer opcional la invalidación de CloudFront (`if (!YOUR_CF_DISTRIBUTION_ID) skip`).
  - Mantener `revalidateTag` + `revalidatePath` inalterados.
- [ ] Crear `vercel.json` con:
  ```json
  {
    "regions": ["iad1"],
    "framework": "nextjs",
    "functions": {
      "src/app/**/route.ts": { "runtime": "nodejs24.x", "maxDuration": 60 },
      "src/app/**/page.tsx": { "runtime": "nodejs24.x" }
    }
  }
  ```
- [ ] Actualizar `.github/workflows/deploy.yml`:
  - Cambiar trigger para incluir `pull_request` (preview deploys en PRs).
  - Reemplazar `npx sst deploy --stage production` por lógica condicional:
    - Push a `main` → `vercel deploy --prod --token=$VERCEL_TOKEN`.
    - PR → `vercel deploy --token=$VERCEL_TOKEN` + comentar URL en el PR.
  - Añadir pasos previos: `npm run lint` + `npm run test:unit`.
  - Renombrar workflow a `ncol-next` (mantener) o `deploy` (cosmético).
- [ ] Documentar en `CLAUDE.md`:
  - Nueva mecánica de deploy (GH Actions + Vercel CLI).
  - Dependencia de audio con AWS post-migración.
  - Ubicación de `AudioBucket` y `cdn.noticiascol.com` (fuera del control de Vercel).
- [ ] Verificar que E2E de Playwright pasa contra `next start` local con las envs de producción simuladas.

**Tú (Miguel):**

- [ ] **Antes de reviewear**: ejecutar `volta pin node@24` en tu máquina local para forzar el pin (Volta actualiza `package.json`). Verificar con `node -v` que responde 24.x en el directorio del repo.
- [ ] Correr `npm install --legacy-peer-deps` para regenerar `package-lock.json` con Node 24.
- [ ] Correr `npm run build` + `npm run test:unit` + `npm run lint` localmente.
- [ ] Review + merge del PR a `main` (sin trigger de deploy real todavía — el workflow requiere secrets Vercel que aún no existen).

### Setup IAM en AWS

**Yo (Claude):**

- [ ] Entregar los comandos exactos:
  ```bash
  aws iam create-user --user-name ncol-vercel-audio
  aws iam put-user-policy --user-name ncol-vercel-audio \
    --policy-name AudioAccess --policy-document file://policy.json
  aws iam create-access-key --user-name ncol-vercel-audio
  ```

**Tú (Miguel):**

- [ ] Ejecutar los comandos.
- [ ] Guardar `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` (los pondrás en Vercel en Fase 2).

**Entregable de fase**: PR mergeado + IAM user creado con access keys guardadas.

---

## Fase 2 — Setup Vercel + Deploy preview

**Duración estimada**: 1 día. **Riesgo**: Bajo.

### Tú (Miguel)

- [ ] En Vercel dashboard: `Import Project` desde GitHub → `antekera/ncol-next`.
- [ ] Configurar:
  - Framework preset: Next.js (auto-detect).
  - Root directory: `.`.
  - Node.js version: 24.x.
  - Build command: default (`next build`).
  - **Desactivar el auto-deploy de Vercel Git Integration** (Settings → Git → Ignored Build Step: `exit 0`). Los deploys los va a manejar GitHub Actions.
- [ ] Añadir env vars en Vercel (dashboard → Settings → Environment Variables) siguiendo la tabla de Fase 0. Marcar por environment (Production / Preview / Development).
- [ ] Añadir env vars específicas del audio user: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=us-east-1`.
- [ ] Crear un Vercel Access Token (Settings → Tokens): scope `Full Account`, nombre `ncol-github-actions`. Copiar valor.
- [ ] Obtener `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`:
  ```bash
  npx vercel link  # local, en un checkout del repo
  cat .vercel/project.json
  ```
- [ ] Añadir en GitHub → Settings → Secrets and variables → Actions:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

### Yo (Claude)

- [ ] Verificar que el workflow arranca correctamente en el próximo push.
- [ ] Revisar build logs del primer deploy preview: bundle sizes, warnings, cold start times.
- [ ] Comparar output de `next build` local vs Vercel.

**Entregable de fase**: URL de preview deploy funcional.

---

## Fase 3 — QA en preview

**Duración estimada**: 2-3 días. **Riesgo**: Medio.

### Yo (Claude)

- [ ] Correr Playwright E2E contra `PLAYWRIGHT_BASE_URL=<preview-url>`.
- [ ] Verificar rutas manualmente en la preview:
  - [ ] `/` (home)
  - [ ] `/categoria/nacionales/`
  - [ ] `/etiqueta/venezuela/`
  - [ ] `/autor/{slug}/`
  - [ ] `/{year}/{month}/{day}/{slug}/` (post individual)
  - [ ] `/busqueda/?q=...`
  - [ ] `/dolar-hoy/`
  - [ ] `/horoscopo/`
  - [ ] `/mas-leidos/`
  - [ ] `/lo-ultimo/`
  - [ ] `/quienes-somos/`, `/contacto/`, `/denuncias/`
- [ ] Verificar endpoints API:
  - [ ] `POST /api/audio` con token válido → genera mp3 en AudioBucket y retorna URL.
  - [ ] `POST /api/audio` con mp3 ya existente → retorna URL cacheada sin llamar Polly.
  - [ ] `GET /api/revalidate?secret=...&path=/algun-post/` → tag revalidation OK.
  - [ ] `GET /api/most-visited`, `/api/horoscopo`, `/api/robots` (si aplica).
- [ ] Verificar assets:
  - [ ] `next/image` optimiza correctamente desde `cdn.noticiascol.com`.
  - [ ] `robots.txt`, `sitemap.xml`, `articles-sitemap.xml`, feeds RSS.
  - [ ] Fonts custom cargan.
- [ ] Verificar integraciones:
  - [ ] Sentry recibe eventos de la preview.
  - [ ] Google Ads / GTM cargan.
  - [ ] Turso (dolar, horoscopo, views) responde.
  - [ ] Turnstile (Cloudflare) en formularios.
  - [ ] Resend (emails de opinión).
  - [ ] Telegram bot (notificaciones opinión).
- [ ] Comparar Core Web Vitals preview vs producción actual (Chrome DevTools + PageSpeed Insights):
  - [ ] LCP, CLS, INP.
  - [ ] TTFB (esperar ligero cambio por región).
- [ ] Revisar Vercel Analytics durante 24h en la preview.
- [ ] Verificar en logs de Vercel Functions que no hay errores 500 en rutas críticas.

### Tú (Miguel)

- [ ] Validar visualmente 10-15 URLs críticas (portada + top artículos + categorías + páginas estáticas).
- [ ] Probar audio TTS en 2-3 artículos diferentes.
- [ ] Verificar que Google Ads renderiza correctamente.
- [ ] Confirmar go/no-go para el cutover DNS.

**Entregable de fase**: informe de QA con hallazgos + go/no-go firmado.

---

## Fase 4 — DNS cutover a Vercel

**Duración estimada**: 1 día activo + 48h observación. **Riesgo**: Medio.

### Día D-1 (preparación)

**Tú (Miguel):**

- [ ] Bajar TTL en Route53 a **60 segundos** para:
  - `www.noticiascol.com` (A + AAAA)
  - `noticiascol.com` (A + AAAA)
- [ ] Confirmar cambio con `dig +short www.noticiascol.com` (esperar propagación mínima).
- [ ] Anunciar ventana de mantenimiento internamente (aunque no debería haber downtime).

### Día D (cutover)

**Tú (Miguel):**

- [ ] En Vercel dashboard → Project → Settings → Domains: añadir `www.noticiascol.com` y `noticiascol.com` como custom domains.
- [ ] Vercel te dará instrucciones DNS específicas (típicamente CNAME o A record). Anotar.
- [ ] En Route53:
  - Cambiar registro A de `www.noticiascol.com` → apuntar al target de Vercel (`76.76.21.x` o CNAME `cname.vercel-dns.com`).
  - Cambiar registro AAAA de `www.noticiascol.com` → target IPv6 de Vercel.
  - Cambiar registro A/AAAA del apex `noticiascol.com` según config Vercel (probablemente redirect a www vía Vercel).
- [ ] Verificar propagación:
  ```bash
  dig +short www.noticiascol.com @1.1.1.1
  dig +short www.noticiascol.com @8.8.8.8
  dig +short www.noticiascol.com @208.67.222.222
  ```
- [ ] En Vercel: confirmar que el domain aparece como "Valid Configuration".

**Yo (Claude):**

- [ ] Monitorear Sentry en tiempo real para detectar spikes de errores 5xx.
- [ ] Correr smoke tests contra la URL productiva cada 5 min durante las primeras 2h:
  - Home, un artículo cacheado, un artículo no cacheado, `/api/audio`, `/api/revalidate`.
- [ ] Verificar que los webhooks de revalidación desde WordPress siguen funcionando (los que llaman a `/api/revalidate`).
- [ ] Verificar en Vercel Analytics que llega tráfico real.

### Día D + 48h

**Tú (Miguel):**

- [ ] Confirmar 48h de estabilidad (sin spikes Sentry, sin caída en Vercel Analytics vs baseline CloudFront).
- [ ] Subir TTL de vuelta a 300s o 3600s.
- [ ] Renombrar `.github/workflows/deploy.yml` → `.github/workflows/deploy.yml.disabled` **NO — el workflow ya es el de Vercel post Fase 1**. En su lugar: verificar que el workflow actualizado ejecutó al menos un deploy productivo exitoso.

**Entregable de fase**: sitio productivo en Vercel + 48h de baseline estable.

---

## Fase 5 — Cleanup AWS + GitHub

**Duración estimada**: 1 día. **Riesgo**: Bajo (con secuencia correcta).

### PR 2: `chore/remove-sst-nextjs`

**Yo (Claude):**

- [ ] Editar `sst.config.ts`:
  - Eliminar el bloque `new sst.aws.Nextjs('ncol-next', {...})` completo.
  - Mantener solo `AudioBucket` con su lifecycle.
  - Añadir explícitamente `removal: 'retain'` al AudioBucket como safety.
  - Eliminar el bloque de validación de env vars (`DOMAIN_NAME`, `HOSTED_ZONE_ID`, `YOUR_CF_DISTRIBUTION_ID`, `REVALIDATE_SECRET`).
- [ ] Editar `src/app/api/revalidate/route.ts`:
  - Eliminar `invalidateCloudFront()` function.
  - Eliminar import `@aws-sdk/client-cloudfront`.
- [ ] `npm uninstall @aws-sdk/client-cloudfront`.
- [ ] Editar `package.json`:
  - Revisar si `sst:deploy:staging` y `sst:deploy:production` siguen teniendo sentido. Si solo se usa el AudioBucket, mantenerlos apuntando a un stage separado (ej: `audio-only`).
- [ ] Actualizar `CLAUDE.md`:
  - Sección "Deployment": describir GH Actions + Vercel CLI.
  - Sección "Environment": listar dependencias residuales AWS (AudioBucket, cdn.noticiascol.com).
- [ ] Eliminar env vars muertas de `.env.example` y del código:
  - `YOUR_CF_DISTRIBUTION_ID`
  - `CLOUDFRONT_ACCESS_KEY_ID`
  - `CLOUDFRONT_SECRET_ACCESS_KEY`

**Tú (Miguel):**

- [ ] Review + merge del PR.

### Secuencia estricta de cleanup AWS

**⚠️ IMPORTANTE**: seguir el orden exacto para no romper DNS ni perder AudioBucket.

**Tú (Miguel):**

1. [ ] **Verificar que DNS ya apunta a Vercel** (24-48h después de Fase 4):
   ```bash
   dig +short www.noticiascol.com  # debe dar IPs de Vercel, NO CloudFront
   ```
2. [ ] **Borrar manualmente los Route53 records del stack SST** (Claude entrega el JSON):
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID \
     --change-batch file://delete-sst-records.json
   ```
   Esto evita que `sst remove` intente borrar los records nuevos de Vercel.
3. [ ] **Test de fuego en staging**:
   ```bash
   npx sst remove --stage staging
   ```
   Verificar que borra sin errores.
4. [ ] **Cleanup production**:
   ```bash
   npx sst remove --stage production
   ```
   Con 793k objetos en el assets bucket, esta operación puede tardar 20-40 minutos. Ejecutar en background y monitorear con `aws s3 ls s3://ncol-next-production-ncolnextassetsbucket-havcftbc --recursive --summarize | tail -3`.
5. [ ] **Verificar preservación del AudioBucket**:
   ```bash
   aws s3 ls s3://ncol-next-production-audiobucketbucket-efhrewos
   ```
   Debe seguir listando los 364 mp3s.
6. [ ] **Verificar en AWS Console**:
   - [ ] Distribuciones CF `d1c5zxnaklq0s1` y `d39vgduwccyeum`: Deleted o Disabled.
   - [ ] Buckets `ncol-nextAssets*` y `ncol-nextCdnRedirect*`: borrados.
   - [ ] Lambdas `ncol-next*` (excepto Audio): borradas.
   - [ ] DynamoDB `ncol-nextRevalidationTable`: borrada.
   - [ ] SQS `ncol-nextRevalidationEventsQueue`: borrada.
   - [ ] CloudWatch Log Groups `/aws/lambda/ncol-next*`: borrados.
7. [ ] **Liberar Elastic IP ociosa**:
   ```bash
   aws ec2 describe-addresses --query 'Addresses[?AssociationId==null]'
   aws ec2 release-address --allocation-id eipalloc-xxx
   ```
   Ahorro: $3/mes.
8. [ ] **Cleanup opcional** (después de 30 días de estabilidad):
   - [ ] `sst-asset-dxbucandazws` (bootstrap SST): borrable si no se vuelve a usar SST.
   - [ ] `sst-console-hr3qrc12bw9cspr985vq9f2h`: SST Console UI.
   - [ ] `cdk-hnb659fds-assets-*`, `cf-templates-*`: bootstrap CDK, si no hay otros proyectos.
   - [ ] **NO borrar `sst-state-dxbucandazws`** salvo confirmación 100% de no regresar a SST.

### Cleanup GitHub

**Tú (Miguel):**

- [ ] En GitHub → Settings → Secrets and variables → Actions, **eliminar**:
  - [ ] `AWS_ACCOUNT_ID`
  - [ ] `AWS_ACCESS_KEY_ID` (el viejo del deploy SST — el nuevo va en Vercel, no en GH)
  - [ ] `AWS_SECRET_ACCESS_KEY` (el viejo)
  - [ ] `CLOUDFRONT_ACCESS_KEY_ID`
  - [ ] `CLOUDFRONT_SECRET_ACCESS_KEY`
  - [ ] `YOUR_CF_DISTRIBUTION_ID`
  - [ ] `HOSTED_ZONE_ID` (si se migra DNS a Vercel; mantener si sigue en Route53)
- [ ] En GitHub, **mantener**:
  - [ ] `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (para el deploy).
  - [ ] `SENTRY_AUTH_TOKEN` (si el CI sube source maps).
  - [ ] Todas las envs de runtime que los tests unitarios necesitan (WORDPRESS_API_URL, TURSO_*, etc.).

### Cleanup IAM

**Tú (Miguel):**

- [ ] Eliminar IAM role `GitHub` (OIDC trust ya no necesario si el workflow no llama a AWS):
  ```bash
  aws iam list-attached-role-policies --role-name GitHub
  aws iam detach-role-policy --role-name GitHub --policy-arn <arn>
  aws iam delete-role --role-name GitHub
  ```
- [ ] Verificar que `ncol-vercel-audio` sigue existiendo y con permisos correctos.

**Entregable de fase**: AWS reducido a solo AudioBucket + cdn.noticiascol.com + Route53. GH limpio.

---

## Fase 6 — Optimización SEO server-side

**Duración**: continua, PRs incrementales. **Riesgo**: Bajo.

**Prerrequisito**: 2 semanas de métricas Vercel Analytics + Speed Insights + Search Console.

### Prioridad sugerida

**Yo (Claude), PRs separadas:**

- [ ] PR: convertir `HomeLeftPosts` + `HomeRightPosts` a Server Components.
- [ ] PR: convertir `RecentPosts` a Server Component.
- [ ] PR: convertir `CategoryPosts` a Server Component.
- [ ] PR: convertir `TagPosts` a Server Component.
- [ ] PR: convertir `AuthorPosts` a Server Component.
- [ ] PR: evaluar `MostRecentPostBanner` y `404Posts`.
- [ ] Evaluar adopción de Next.js 16 Cache Components (PPR) para híbrido static+dynamic.
- [ ] Migrar audio a Vercel OIDC → AWS STS AssumeRole (hardening).

**Tú (Miguel):**

- [ ] Definir qué componentes necesitan sí o sí interactividad (skeleton loaders, infinite scroll) que no se pueda hacer server-side.
- [ ] Review de cada PR incremental.
- [ ] Medir impacto SEO en Search Console (positions, impressions) por cada cambio.

**Entregable de fase**: reporte trimestral de Core Web Vitals + SEO metrics.

---

## Anexos

### Anexo A — Env vars mapeadas (a completar en Fase 0)

| Variable                             | Environments | Tipo | Origen actual | Uso |
| ------------------------------------ | ------------ | ---- | ------------- | --- |
| _(a completar por Claude en Fase 0)_ |              |      |               |     |

### Anexo B — IAM Policy para `ncol-vercel-audio` (a completar en Fase 0)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PollySynthesize",
      "Effect": "Allow",
      "Action": ["polly:SynthesizeSpeech"],
      "Resource": "*"
    },
    {
      "Sid": "AudioBucketReadWrite",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::ncol-next-production-audiobucketbucket-efhrewos/audio/*"
    },
    {
      "Sid": "AudioBucketList",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::ncol-next-production-audiobucketbucket-efhrewos"
    }
  ]
}
```

### Anexo C — `vercel.json` propuesto

```json
{
  "regions": ["iad1"],
  "framework": "nextjs",
  "functions": {
    "src/app/**/route.ts": {
      "runtime": "nodejs24.x",
      "maxDuration": 60
    },
    "src/app/**/page.tsx": {
      "runtime": "nodejs24.x"
    }
  }
}
```

### Anexo D — Workflow GitHub Actions propuesto (a completar en Fase 1)

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm ci --legacy-peer-deps
      - run: npm run lint
      - run: npm run test:unit

  deploy:
    needs: quality
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'Production' || 'Preview' }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }} --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build
        run: vercel build ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy
        run: vercel deploy --prebuilt ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }}
```

### Anexo E — Costos observados (baseline)

- Ver [Diagnóstico de costos AWS](#diagnóstico-de-costos-aws) arriba.
- Rango medido: últimos 25 días previos a 2026-08-25.
- Método: `aws ce get-cost-and-usage` agrupado por SERVICE y USAGE_TYPE.

### Anexo F — Referencias

- SST config actual: `sst.config.ts`
- Next.js config actual: `next.config.mjs`
- Workflow actual: `.github/workflows/deploy.yml`
- Endpoint audio: `src/app/api/audio/route.ts`
- Endpoint revalidate: `src/app/api/revalidate/route.ts`
- Data layer: `src/app/actions/fetchAPI.ts`

---

## Registro de decisiones

| Fecha      | Decisión                                         | Racional                                                                                                     |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 2026-08-25 | Migrar a Vercel Pro                              | Ahorro ~$45/mes + eliminación de OpenNext operational overhead                                               |
| 2026-08-25 | Mantener GH Actions con Vercel CLI (Opción B)    | Portabilidad futura a otros proveedores                                                                      |
| 2026-08-25 | Pin a región `iad1`, runtime Node.js             | Tráfico venezolano concentrado, sin ventaja del edge global                                                  |
| 2026-08-25 | NO refactorizar caching pre-migración            | Aislar variables para diagnosticar regresiones                                                               |
| 2026-08-25 | IAM user con access keys para audio (Opción A)   | Migración rápida; OIDC como hardening en Fase 6                                                              |
| 2026-08-25 | Mantener DNS en Route53                          | Minimizar cambios; solo actualizar records A/AAAA                                                            |
| 2026-08-25 | Retener AudioBucket + cdn.noticiascol.com en AWS | Servicios estables que no aportan ahorro migrar                                                              |
| 2026-08-25 | Saltar de Node 20 → Node 24 LTS en Fase 1        | Node 24 es el default actual en Vercel; aprovechar la migración para alinear runtime local + CI + producción |

---

## Contacto y ownership

- **Owner**: Miguel Antekera (miguel.antekera@gmail.com)
- **Executor de plan**: Claude Code (sesiones interactivas)
- **Repo**: [antekera/ncol-next](https://github.com/antekera/ncol-next)
- **Cuenta AWS**: 979356214128
