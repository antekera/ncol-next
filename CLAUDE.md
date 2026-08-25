# ncol-next

News media frontend for [noticiascol.com](https://noticiascol.com) — a Venezuela-based news site. Built with Next.js (App Router) backed by WordPress via GraphQL.

## Architecture

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS 4
- **Backend/CMS**: WordPress + WPGraphQL (headless)
- **Database**: LibSQL / Turso (via Drizzle ORM) — used for supplementary data (e.g. dollar rates)
- **Deployment**: Vercel (via GitHub Actions + Vercel CLI). Region pinned to `iad1`, Node.js 24 LTS runtime. `AudioBucket` (Polly TTS mp3s) permanece en AWS S3 y se accede vía IAM user `ncol-vercel-audio`. Imágenes editoriales servidas por `cdn.noticiascol.com` (S3 + CloudFront, gestionado por plugin WP Offload Media, independiente de la app).
- **Error tracking**: Sentry
- **Component library**: Storybook

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    (category)/         # Category listing routes
    (centered)/         # Centered layout group
    (clean)/            # Clean layout group
    (sidebar)/          # Sidebar layout group
    [posts]/            # Dynamic post pages
    actions/            # Server Actions
    api/                # Route Handlers
  components/
    blocks/             # Complex UI sections (Header, Footer, article blocks)
    ui/                 # Primitive/reusable components
```

## Key Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build (also runs next-sitemap postbuild)
npm run start            # Start production server
npm run test:unit        # Jest unit tests (with coverage)
npm run test:e2e         # Playwright E2E tests (uses next start)
npm run lint             # ESLint (zero warnings enforced)
npm run format           # Prettier
npm run storybook:start  # Storybook dev server on :6006
```

## Deployment

- **Automático**: push a `vercel-main` (branch de trabajo durante migración; será `main` post cutover) → GitHub Actions corre lint + tests → `vercel deploy --prod`. PR contra `vercel-main` → preview deploy en Vercel con URL comentada en el PR.
- **Manual (hotfix)**: `npx vercel deploy --prod --token=<VERCEL_TOKEN>` desde local.
- Los deploys los orquesta `.github/workflows/deploy.yml`. Vercel Git integration nativo está desactivado (Ignored Build Step) para mantener el control en GitHub Actions.
- Rollback: Vercel dashboard → Deployments → Promote una versión anterior.

## Testing

- **Unit**: Jest + React Testing Library. Run `npm run test:unit` before committing.
- **E2E**: Playwright against built app.
  - Default (stable CI): `npm run test:e2e`
  - Standalone (mirrors prod): `USE_STANDALONE=true npm run test:e2e`
- **Pre-commit hook**: lint-staged runs ESLint + Prettier + related Jest tests automatically.
- **CI**: GitHub Actions corre `lint` + `test:unit` como quality gate antes del deploy a Vercel.

## Conventions

- **Route groups**: Use layout groups `(category)`, `(centered)`, `(clean)`, `(sidebar)` to share layouts without affecting URL paths.
- **Server vs Client components**: Default to React Server Components. Add `'use client'` only when needed (interactivity, browser APIs, hooks).
- **Data fetching**: Fetch in Server Components; avoid client-side fetching unless necessary. Use `Promise.all` to prevent data waterfalls.
- **Images**: Always use `next/image`. Configure remote WordPress image domains in `next.config`.
- **Fonts**: Use `next/font`.
- **Styling**: TailwindCSS 4 utility classes. Use `tailwind-merge` (`cn()` helper) to merge classes conditionally.
- **Dead code**: Run `npm run find-duplicate-code` (knip) to detect unused exports.

## WordPress / GraphQL Integration

- All CMS content (posts, categories, tags, authors) is fetched from WordPress via WPGraphQL.
- Do not store editorial content in the local database — that belongs in WordPress.
- LibSQL/Turso is used only for non-editorial data (e.g. currency rates).

## Environment

Node 24 LTS (pineado vía Volta y `engines.node`). Use `npm install --legacy-peer-deps` si aparecen conflictos de peer deps (`install:clean` hace reset completo).

Env vars de producción/preview: gestionadas en Vercel Dashboard (Settings → Environment Variables). Ver `VERCEL_MIGRATION.md` para el inventario completo y el mapping AWS → Vercel.
