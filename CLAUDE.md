# ncol-next

News media frontend for [noticiascol.com](https://noticiascol.com) — a Venezuela-based news site. Built with Next.js (App Router) backed by WordPress via GraphQL.

## Architecture

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS 4
- **Backend/CMS**: WordPress + WPGraphQL (headless)
- **Database**: LibSQL / Turso (via Drizzle ORM) — used for supplementary data (e.g. dollar rates)
- **Deployment**: SST (AWS) — `staging` and `production` stages
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

# Deployment (runs tests first)
npm run sst:deploy:staging
npm run sst:deploy:production
```

## Testing

- **Unit**: Jest + React Testing Library. Run `npm run test:unit` before committing.
- **E2E**: Playwright against built app.
  - Default (stable CI): `npm run test:e2e`
  - Standalone (mirrors prod): `USE_STANDALONE=true npm run test:e2e`
- **Pre-commit hook**: lint-staged runs ESLint + Prettier + related Jest tests automatically.
- Deployment scripts (`sst:deploy:*`) run both unit and E2E tests before deploying.

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

Node 20 (pinned via Volta). Use `npm install --legacy-peer-deps` if peer dep conflicts arise (`install:clean` script handles full reset).
