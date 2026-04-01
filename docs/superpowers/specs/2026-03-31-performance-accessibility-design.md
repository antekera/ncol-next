# Performance & Accessibility Improvements — Design Spec

**Date:** 2026-03-31  
**Project:** ncol-next (noticiascol.com)  
**Baseline scores:** Performance 49 · Accessibility 86 · Best Practices 96 · SEO 100  
**Key metrics:** FCP 3.8s · LCP 14.6s · TBT 470ms · CLS 0.127 · Speed Index 4.3s

---

## Constraints

- Deployment: SST on AWS (`output: 'standalone'`). No new Lambda executions per page render.
- `images.unoptimized: true` stays — Next.js runtime image optimization is off (Lambda cost). Image optimization is a separate CDN/WordPress infrastructure task.
- No new server-side Next.js data fetching patterns — existing WPGraphQL fetch utilities are reused.

---

## Phase 1 — Critical LCP Fixes

### 1.1 PostHero → React Server Component

**Problem:** `PostHero` is `'use client'` and fetches via SWR (`useHeroPosts`). The LCP image URL is unknown until JS downloads, parses, hydrates, and the SWR fetch completes — causing LCP of 14.6s.

**Solution:** Convert `PostHero` to a React Server Component.

**New fetch logic (server-side):**
1. Query WPGraphQL for posts where `post_destacado = true`. Take the first result.
2. If none, fall back to `first: 1` from the default left category ordered by date descending.
3. The fetched post data (including image URL) is embedded in the initial HTML.

**Personalization removed:** The `getMostVisitedCategory()` / localStorage personalization is dropped. No category preference logic.

**Component changes:**
- Remove `'use client'` directive from `PostHero`
- Remove hooks: `useHeroPosts`, `useUserCategories`, `useMostVisitedPosts`, `useIsMobile`, `useCallback`, `useEffect`, `useState`
- Accept fetched post data as props from the parent Server Component (home page)
- The `MostVisitedPosts` mobile section is extracted to its own `<MostVisitedPostsMobile>` client component, rendered separately in the home page layout using a CSS `md:hidden` class instead of a JS `useIsMobile()` hook
- `priority={true}` on `CoverImage` remains — Next.js will now emit `fetchpriority="high"` automatically since the component is server-rendered

**GraphQL query additions:**
- New query: fetch post with `metaQuery: { key: "post_destacado", value: "1" }`, `first: 1`
- Fallback query: existing category posts query with `first: 1`, ordered by `DATE` descending

**Files affected:**
- `src/components/PostHero/index.tsx` — convert to RSC, accept props
- `src/app/page.tsx` (or home layout) — call new fetch, pass data to `PostHero`
- `src/app/actions/` — add new server action or GraphQL query for featured post
- `src/lib/hooks/data/useHeroPosts.ts` — no longer used by PostHero (can be deleted if unused elsewhere)

---

### 1.2 Font Optimization

**Problem:**
- `@import url('https://fonts.googleapis.com/css2?family=Manrope...')` at top of `index.css` is render-blocking (780ms penalty).
- Manual `@font-face` for Google Sans in `index.css` adds an unpreconnected `fonts.gstatic.com` request.

**Solution:** Load all fonts via `next/font/google` in `layout.tsx`. Remove all font loading from `index.css`.

**Font mapping:**
| Old font | New font | Role | CSS variable |
|---|---|---|---|
| Google Sans | **Outfit** (weights 200–800) | Primary sans-serif | `--font-sans` |
| Manrope | Removed — replaced by Outfit | — | — |
| Martel | **Martel** (weights 400, 700, 800) | Serif / article body | `--font-serif` |

**Implementation:**
```tsx
// layout.tsx
import { Outfit, Martel } from 'next/font/google'

const outfit = Outfit({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
})

const martel = Martel({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif'
})

// Apply both variables to <html>
<html className={`${outfit.variable} ${martel.variable}`}>
```

**`index.css` changes:**
- Remove `@import url('https://fonts.googleapis.com/css2?family=Manrope...')`
- Remove `@font-face { font-family: 'Google Sans'; ... }` block
- Keep `--font-sans` and `--font-serif` Tailwind theme tokens as-is (they resolve via CSS variables)

**Files affected:**
- `src/app/layout.tsx`
- `src/styles/index.css`

---

### 1.3 Preconnect Hints

**Problem:** No `preconnect` hints. Lighthouse flags 320ms LCP savings from early-connecting to third-party origins.

**Solution:** Add `<link rel="preconnect">` tags in `layout.tsx`'s `<head>`:

```tsx
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://www.google.com" />
<link rel="preconnect" href="https://pagead2.googlesyndication.com" />
<link rel="preconnect" href="https://ep1.adtrafficquality.google" />
```

Note: Font preconnects are not needed — `next/font/google` handles them automatically.

**Files affected:**
- `src/app/layout.tsx`

---

## Phase 2 — JS Bundle Size

### 2.1 TypeScript Target

**Problem:** `tsconfig.json` has `"target": "es6"` (ES2015). Lighthouse reports 13.6 KiB of wasted polyfills for Baseline features: `Array.prototype.at`, `Array.prototype.flat`, `Array.prototype.flatMap`, `Object.fromEntries`, `Object.hasOwn`, `String.prototype.trimEnd`, `String.prototype.trimStart`.

**Solution:** Change `"target"` from `"es6"` to `"ES2017"` in `tsconfig.json`. No code changes required — TypeScript stops emitting polyfills for natively-supported features.

**Files affected:**
- `tsconfig.json`

---

## Phase 3 — Accessibility Quick Wins

All fixes are isolated `aria-label` additions and one heading level correction. No behavior changes.

### 3.1 ButtonGoTop — missing `aria-label`

**File:** `src/components/ButtonGoTop/index.tsx`  
**Fix:** Add `aria-label="Ir al inicio de la página"` to the `<button>` element.

### 3.2 Logo Link — no accessible text

**File:** `src/components/Logo/index.tsx`  
**Fix:** Add `aria-label="Noticiascol - Ir a la página principal"` to the `<Link>` element (class `link-logo`).

### 3.3 SideNav overlay button — no `aria-label`

**File:** `src/components/SideNav/index.tsx`  
**Fix:** Add `aria-label="Cerrar menú"` to the overlay `<button>` (class `link-menu-button-open`).

### 3.4 Sidebar service links — no accessible text

**File:** To be confirmed by reading the `SERVICES_MENU` constants and their rendered link components.  
**Fix:** Add descriptive `aria-label` to each icon-only anchor matching its destination (e.g., `aria-label="Denuncias"`, `aria-label="Horóscopo"`, `aria-label="Dólar hoy"`, `aria-label="Más visto hoy"`).

### 3.5 Heading order — non-sequential levels

**Problem:** A `<h5>` ("LEÍDO") is followed by a `<h6>` (portal description text) in the sidebar, creating a non-sequential heading hierarchy.  
**Fix:** Change the `<h6>` to a `<p>` — it is descriptive text, not a heading.  
**File:** To be confirmed by reading the sidebar/most-read component.

---

## Expected Outcome

| Metric | Before | Expected after Phase 1 |
|---|---|---|
| Performance | 49 | 65–80 |
| LCP | 14.6s | ~3–5s |
| FCP | 3.8s | ~1.5–2.5s |
| Accessibility | 86 | 86 (Phase 3 → ~95) |

Phase 2 adds ~13.6 KiB JS savings (TBT improvement).  
Phase 3 brings accessibility from ~86 to ~95.
