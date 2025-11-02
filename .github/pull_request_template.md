## Next.js 15 → 16 Migration PR

This PR upgrades the application to Next.js 16 and applies required code & config changes. Please use the checklist below to validate stability prior to merging.

### Summary
- Upgrade to `next@16`, `react@19`, `react-dom@19`
- Switch linting from `next lint` to ESLint CLI
- Apply Next codemod for async Dynamic APIs
- Enable Turbopack filesystem cache for dev
- Remove deprecated `images.domains` and rely on `images.remotePatterns`
- Adjust Playwright to use `node .next/standalone/server.js` for E2E
- Generate Next types via `npx next typegen`

### Migration Checklist

- [ ] Dependencies updated:
  - [ ] `next@16`
  - [ ] `react@19` and `react-dom@19`
  - [ ] `@next/third-parties@16`
  - [ ] `eslint-config-next@16` and `@next/eslint-plugin-next@16`
  - [ ] Verify `@sentry/nextjs` compatibility (upgrade if recommended)

- [ ] Async Dynamic APIs (breaking in v16):
  - [ ] `cookies()`, `headers()`, `draftMode()` are awaited in server components/handlers
  - [ ] `params` and `searchParams` accessed asynchronously in `page`, `layout`, and metadata routes
  - [ ] Any `generateImageMetadata`-related params updated to handle `Promise<string>` where applicable

- [ ] Config updates:
  - [ ] `next.config.mjs` uses `experimental.turbopackFileSystemCacheForDev`
  - [ ] Remove any `amp` config (if present)
  - [ ] `images.domains` removed; `images.remotePatterns` in use
  - [ ] Set `turbopack.root` and `outputFileTracingRoot` to silence workspace root warnings
  - [ ] `package.json` script `lint` uses `eslint . --max-warnings=0`

- [ ] Code health:
  - [ ] `npx next typegen` run, TS config updated (jsx=react-jsx; includes route types)
  - [ ] ESLint runs clean (or captured in follow-ups if rule updates needed)

- [ ] Validation:
  - [ ] `npm run build` succeeds without errors
  - [ ] Unit tests (`npm run test:unit`) pass
  - [ ] E2E tests (`npm run test:e2e`) pass; Playwright uses standalone server command
  - [ ] Manual QA on staging: critical flows, images, middleware headers/caching, performance (CWV)

### Rollout
- [ ] Canary release or gradual traffic ramp-up planned
- [ ] Rollback plan documented to previous Next 15 release
- [ ] Monitoring in place (Sentry error rates, Vercel Analytics/Web Vitals, infra metrics)

### Notes
Add any known caveats or follow-ups here.

