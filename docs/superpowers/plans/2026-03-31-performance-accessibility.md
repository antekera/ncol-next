# Performance & Accessibility Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Lighthouse Performance from 49 to ~65–80 and Accessibility from 86 to ~95 by converting PostHero to RSC, fixing fonts, adding preconnects, fixing the TS target, and adding missing aria labels.

**Architecture:** Three independent phases. Phase 1 targets LCP (14.6s → ~3–5s) by server-rendering the hero post and eliminating render-blocking fonts. Phase 2 removes 13.6 KiB of unnecessary JS polyfills. Phase 3 adds missing aria labels and fixes heading hierarchy.

**Tech Stack:** Next.js 16 App Router, React 19 RSC, `next/font/google`, WPGraphQL via `cachedFetchAPI`, TypeScript, TailwindCSS 4.

**Spec:** `docs/superpowers/specs/2026-03-31-performance-accessibility-design.md`

---

## File Map

### Phase 1 — Files touched

| File | Action | Purpose |
|---|---|---|
| `src/app/actions/getFeaturedPost/query.ts` | **Create** | GraphQL query for `post_destacado=true` post |
| `src/app/actions/getFeaturedPost/index.ts` | **Create** | Server action that fetches featured post, falls back to most recent left-category post |
| `src/components/PostHero/index.tsx` | **Modify** | Remove `'use client'`, hooks, SWR; accept `PostHome` prop |
| `src/components/PostHero/MostVisitedPostsMobile.tsx` | **Create** | Client wrapper rendering `<MostVisitedPosts>` with `md:hidden` |
| `src/app/page.tsx` | **Modify** | Call `getFeaturedPost()`, pass result to `<PostHero>`, add `<MostVisitedPostsMobile>` |
| `src/app/layout.tsx` | **Modify** | Add Outfit font, export CSS variables to `<html>`, add preconnect hints |
| `src/styles/index.css` | **Modify** | Remove `@import` Manrope, remove `@font-face` Google Sans block |

### Phase 2 — Files touched

| File | Action | Purpose |
|---|---|---|
| `tsconfig.json` | **Modify** | Change `target` from `"es6"` to `"ES2017"` |

### Phase 3 — Files touched

| File | Action | Purpose |
|---|---|---|
| `src/components/ButtonGoTop/index.tsx` | **Modify** | Add `aria-label` |
| `src/components/Logo/index.tsx` | **Modify** | Add `aria-label` to `<Link>` |
| `src/components/SideNav/index.tsx` | **Modify** | Add `aria-label` to overlay button |
| `src/components/SideNav/MenuLink.tsx` | **Modify** | Add `aria-label={item.name}` to service-link variant |
| `src/components/MostVisitedPosts/index.tsx` | **Modify** | Change `<h6>` to `<p>` in footer description area |

---

## Phase 1 — Critical LCP Fixes

### Task 1: Create `getFeaturedPost` server action

**Files:**
- Create: `src/app/actions/getFeaturedPost/query.ts`
- Create: `src/app/actions/getFeaturedPost/index.ts`

- [ ] **Step 1: Create the GraphQL query file**

Create `src/app/actions/getFeaturedPost/query.ts`:

```ts
import { IMAGE_SIZES } from '@lib/constants'

// Fetches the first post with post_destacado=true, ordered by date DESC
export const queryFeaturedPost = `
query FeaturedPost {
  posts(
    first: 1
    where: { orderby: { field: DATE, order: DESC }, status: PUBLISH, metaQuery: { metaArray: [{ key: "post_destacado", value: "1", compare: EQUAL_TO }] } }
  ) {
    edges {
      node {
        title
        excerpt
        id
        uri
        date
        slug
        featuredImage {
          node {
            sourceUrl(size: ${IMAGE_SIZES.LARGE})
            srcSet
          }
        }
        categories {
          edges {
            node {
              name
              slug
              parentId
            }
          }
        }
        customFields {
          videodestacado
          noticiadestacada
        }
      }
    }
  }
}
`

// Fetches the most recent post from the given category slug
export const queryLatestFromCategory = `
query LatestFromCategory($slug: String!) {
  posts(
    first: 1
    where: { orderby: { field: DATE, order: DESC }, categoryName: $slug, status: PUBLISH }
  ) {
    edges {
      node {
        title
        excerpt
        id
        uri
        date
        slug
        featuredImage {
          node {
            sourceUrl(size: ${IMAGE_SIZES.LARGE})
            srcSet
          }
        }
        categories {
          edges {
            node {
              name
              slug
              parentId
            }
          }
        }
        customFields {
          videodestacado
          noticiadestacada
        }
      }
    }
  }
}
`
```

- [ ] **Step 2: Create the server action**

Create `src/app/actions/getFeaturedPost/index.ts`:

```ts
'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { CATEGORIES, TIME_REVALIDATE } from '@lib/constants'
import { PostHome } from '@lib/types'
import { queryFeaturedPost, queryLatestFromCategory } from './query'

interface PostsResult {
  posts: {
    edges: { node: PostHome }[]
  }
}

export async function getFeaturedPost(): Promise<PostHome | null> {
  // 1. Try to find a post with post_destacado = true
  const featuredData = await cachedFetchAPI<PostsResult>({
    query: queryFeaturedPost,
    revalidate: TIME_REVALIDATE.HOUR
  })

  const featuredPost = featuredData?.posts?.edges?.[0]?.node ?? null

  if (featuredPost) {
    return featuredPost
  }

  // 2. Fallback: most recent post from the left column category
  const fallbackData = await cachedFetchAPI<PostsResult>({
    query: queryLatestFromCategory,
    variables: { slug: CATEGORIES.COL_LEFT },
    revalidate: TIME_REVALIDATE.HOUR
  })

  return fallbackData?.posts?.edges?.[0]?.node ?? null
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in the new files.

- [ ] **Step 4: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/app/actions/getFeaturedPost/
git commit -m "feat: add getFeaturedPost server action with post_destacado fallback"
```

---

### Task 2: Convert `PostHero` to RSC and extract `MostVisitedPostsMobile`

**Files:**
- Modify: `src/components/PostHero/index.tsx`
- Create: `src/components/PostHero/MostVisitedPostsMobile.tsx`

- [ ] **Step 1: Create `MostVisitedPostsMobile` client wrapper**

Create `src/components/PostHero/MostVisitedPostsMobile.tsx`:

```tsx
'use client'

import { MostVisitedPosts } from '@components/MostVisitedPosts'

const MostVisitedPostsMobile = () => (
  <div className='my-6 md:hidden'>
    <MostVisitedPosts className='sidebar-most-visited' />
  </div>
)

export { MostVisitedPostsMobile }
```

- [ ] **Step 2: Rewrite `PostHero` as RSC**

Replace the entire content of `src/components/PostHero/index.tsx`:

```tsx
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { CoverImage } from '@components/CoverImage'
import { PostCategories } from '@components/PostCategories'
import { PostHome } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'
import { DateTime } from '@components/DateTime'
import { Excerpt } from '@components/Excerpt'
import { GA_EVENTS } from '@lib/constants'

type PostHeroProps = {
  post: PostHome | null
}

const PostHero = ({ post }: PostHeroProps) => {
  if (!post) return null

  const { featuredImage, uri, title, excerpt, date, categories } = post

  return (
    <section className='mb-4'>
      {featuredImage && title && (
        <div className='relative z-1 -mx-6 -mb-12 h-48 w-auto sm:mx-0 sm:h-64 sm:w-full lg:h-72'>
          <CoverImage
            className='relative block h-48 w-full sm:h-60 md:h-60 lg:h-72'
            priority={true}
            uri={uri}
            title={title}
            coverImage={featuredImage?.node?.sourceUrl}
            srcSet={featuredImage?.node?.srcSet}
            size='lg'
          />
        </div>
      )}
      <div className='content border-primary relative z-2 -ml-6 w-auto border-t-4 bg-white px-5 py-4 sm:ml-0 sm:w-11/12 dark:bg-neutral-800 dark:hover:text-neutral-100'>
        {categories && (
          <PostCategories
            slice={2}
            className='text-primary mb-3 uppercase'
            {...categories}
          />
        )}
        {uri && (
          <h1 className='mb-2 font-serif text-2xl leading-8 font-bold text-slate-900 lg:text-4xl lg:leading-11'>
            <HoverPrefetchLink
              href={uri}
              className='hover:text-primary dark:text-neutral-300 dark:hover:text-neutral-100'
              aria-label={title}
              onClick={() =>
                GAEvent({
                  category: GA_EVENTS.POST_LINK.COVER.CATEGORY,
                  label: GA_EVENTS.POST_LINK.COVER.LABEL
                })
              }
            >
              {title}
            </HoverPrefetchLink>
          </h1>
        )}
        <hr className='relative mt-4 mb-3 w-full text-slate-200 sm:w-48 md:w-80 dark:border-neutral-500' />
        <div className='mb-4 font-sans text-xs md:mb-0'>
          <Excerpt className='mb-2' text={excerpt} />
          <DateTime dateString={date} />
        </div>
      </div>
    </section>
  )
}

export { PostHero }
```

Note: `size='lg'` is used always (no `useIsMobile`). The mobile-specific smaller image is no longer needed for the hero since the server can't know the device. `lg` (1134px) is correct — the browser will pick the right srcSet entry based on actual display width.

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/components/PostHero/
git commit -m "feat: convert PostHero to RSC, extract MostVisitedPostsMobile"
```

---

### Task 3: Wire PostHero into the home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update home page to fetch and pass hero post**

Replace the content of `src/app/page.tsx`:

```tsx
export const dynamic = 'force-static'

import { Suspense } from 'react'
import * as Sentry from '@sentry/nextjs'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { Container } from '@components/Container'
import { Header } from '@components/Header'
import { Loading } from '@components/LoadingHome'
import { Newsletter } from '@components/Newsletter'
import { PostHero } from '@components/PostHero'
import { MostVisitedPostsMobile } from '@components/PostHero/MostVisitedPostsMobile'
import { Sidebar } from '@components/Sidebar'
import { ad } from '@lib/ads'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { ClientRightPosts } from '@blocks/content/HomeRightPosts'
import { ClientLeftPosts } from '@blocks/content/HomeLeftPosts'
import { MobileRankingLinks } from '@components/MobileRankingLinks'
import { getFeaturedPost } from '@app/actions/getFeaturedPost'

export const metadata: Metadata = sharedOpenGraph

const leftQty = 10
const rightQty = 10

const PageContent = async () => {
  try {
    const featuredPost = await getFeaturedPost()

    return (
      <section className='w-full pb-2 md:w-2/3 md:pr-8 lg:w-3/4'>
        <div className='-mt-6 sm:mt-0'>
          <PostHero post={featuredPost} />
          <MostVisitedPostsMobile />
        </div>
        <div className='mb-10 -ml-1 md:ml-0 md:flex'>
          <div className='flex-none md:w-3/5 md:pr-3 md:pl-5'>
            <ClientLeftPosts offset={0} qty={leftQty} />
            <div className='mb-4'>
              <AdSenseBanner {...ad.global.more_news} />
            </div>
            <ClientLeftPosts offset={leftQty} qty={leftQty} enableLazyLoad />
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <Newsletter className='my-4 md:hidden' />
            <ClientRightPosts offset={0} qty={rightQty} />
            <div className='mb-4'>
              <AdSenseBanner
                className='bloque-adv-list'
                {...ad.home.in_article_left}
              />
            </div>
            <ClientRightPosts offset={rightQty} qty={rightQty} enableLazyLoad />
          </div>
        </div>
      </section>
    )
  } catch (err) {
    Sentry.captureException(err)
    return notFound()
  }
}

export default async function Page() {
  return (
    <>
      <Header />
      <MobileRankingLinks />
      <Container className='pt-6' sidebar>
        <Suspense fallback={<Loading />}>
          <PageContent />
        </Suspense>
        <Sidebar />
      </Container>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Run unit tests**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run test:unit 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 4: Build to verify no build errors**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run build 2>&1 | tail -30
```

Expected: successful build with no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/app/page.tsx
git commit -m "feat: wire getFeaturedPost into home page, render PostHero as RSC"
```

---

### Task 4: Fix fonts — replace Google Sans + Manrope with Outfit via `next/font/google`

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Remove render-blocking font declarations from `index.css`**

In `src/styles/index.css`, remove these two blocks (lines 1–13):

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap');

@font-face {
  font-family: 'Google Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/googlesans/v27/4UaGrENHsxJlGDuGo1OIlL3Owp4.woff2)
    format('woff2');
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
    U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF,
    U+FFFD;
}
```

The file should now start at the `@plugin` lines.

- [ ] **Step 2: Update `--font-sans` theme token in `index.css`**

In the `@theme` block in `src/styles/index.css`, change:

```css
--font-sans: 'Google Sans', 'sans-serif';
```

to:

```css
--font-sans: var(--font-outfit), sans-serif;
```

- [ ] **Step 3: Update `layout.tsx` to load Outfit and apply CSS variables**

Replace the font section and `<html>` element in `src/app/layout.tsx`:

```tsx
import { Outfit, Martel } from 'next/font/google'

const outfit = Outfit({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit'
})

const martel = Martel({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif'
})
```

Update the `<html>` tag to apply both CSS variables:

```tsx
<html lang='es' suppressHydrationWarning className={`${outfit.variable} ${martel.variable}`}>
```

Remove the `martel.className` from the `<main>` element (it's now applied via CSS variable on `<html>`):

```tsx
<main className={`flex-1 dark:bg-neutral-900`}>
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Run unit tests**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run test:unit 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/app/layout.tsx src/styles/index.css
git commit -m "perf: replace render-blocking fonts with next/font Outfit + Martel"
```

---

### Task 5: Add preconnect hints

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add preconnect links to `<head>` in `layout.tsx`**

In `src/app/layout.tsx`, add the following inside the `<head>` block, before the existing `<script>` tag:

```tsx
<head>
  <link rel='preconnect' href='https://www.googletagmanager.com' />
  <link rel='preconnect' href='https://www.google.com' />
  <link rel='preconnect' href='https://pagead2.googlesyndication.com' />
  <link rel='preconnect' href='https://ep1.adtrafficquality.google' />
  <script
    type='application/ld+json'
    ...
  />
</head>
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/app/layout.tsx
git commit -m "perf: add preconnect hints for GTM, Google CSE, AdSense origins"
```

---

## Phase 2 — JS Bundle Size

### Task 6: Fix TypeScript target to eliminate polyfills

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Change `target` in `tsconfig.json`**

In `tsconfig.json`, find:

```json
"target": "es6"
```

Replace with:

```json
"target": "ES2017"
```

- [ ] **Step 2: Run unit tests**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run test:unit 2>&1 | tail -20
```

Expected: all tests pass (no behavior change, purely build output).

- [ ] **Step 3: Build to confirm no regressions**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run build 2>&1 | tail -30
```

Expected: successful build. The `chunks/972fbaecc1c07c88.js` chunk should be smaller.

- [ ] **Step 4: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add tsconfig.json
git commit -m "perf: update tsconfig target to ES2017 to remove unnecessary polyfills"
```

---

## Phase 3 — Accessibility Quick Wins

### Task 7: Add `aria-label` to `ButtonGoTop`

**Files:**
- Modify: `src/components/ButtonGoTop/index.tsx`

- [ ] **Step 1: Add `aria-label` to the button**

In `src/components/ButtonGoTop/index.tsx`, change:

```tsx
<button
  onClick={goToTop}
  data-testid='button-go-top'
  className='link-go-top bg-primary absolute -top-3 right-6 h-9 w-9 cursor-pointer rounded-sm border-none text-white duration-150 ease-in hover:-top-4'
>
```

to:

```tsx
<button
  onClick={goToTop}
  data-testid='button-go-top'
  aria-label='Ir al inicio de la página'
  className='link-go-top bg-primary absolute -top-3 right-6 h-9 w-9 cursor-pointer rounded-sm border-none text-white duration-150 ease-in hover:-top-4'
>
```

- [ ] **Step 2: Run the ButtonGoTop test**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx jest src/components/ButtonGoTop --no-coverage 2>&1 | tail -15
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/components/ButtonGoTop/index.tsx
git commit -m "a11y: add aria-label to ButtonGoTop"
```

---

### Task 8: Add `aria-label` to Logo link

**Files:**
- Modify: `src/components/Logo/index.tsx`

- [ ] **Step 1: Add `aria-label` to the `<Link>`**

In `src/components/Logo/index.tsx`, change:

```tsx
<Link href='/' className='link-logo' onClick={() => GAEvent(dataLayer)}>
```

to:

```tsx
<Link href='/' className='link-logo' aria-label='Noticiascol - Ir a la página principal' onClick={() => GAEvent(dataLayer)}>
```

- [ ] **Step 2: Check for Logo snapshot tests and update if needed**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx jest src/components/Logo --no-coverage 2>&1 | tail -15
```

If snapshots fail, update them:

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx jest src/components/Logo --no-coverage -u 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/components/Logo/
git commit -m "a11y: add aria-label to Logo link"
```

---

### Task 9: Add `aria-label` to SideNav overlay button

**Files:**
- Modify: `src/components/SideNav/index.tsx`

- [ ] **Step 1: Add `aria-label` to the overlay button**

In `src/components/SideNav/index.tsx`, change:

```tsx
<button
  onClick={handleMenu}
  className={`link-menu-button-open absolute z-20 h-screen w-full bg-black transition-opacity duration-100 ease-in ${
    isMenuActive
      ? 'pointer-events-auto opacity-70'
      : 'pointer-events-none h-0 w-0 opacity-0'
  }`}
/>
```

to:

```tsx
<button
  onClick={handleMenu}
  aria-label='Cerrar menú'
  className={`link-menu-button-open absolute z-20 h-screen w-full bg-black transition-opacity duration-100 ease-in ${
    isMenuActive
      ? 'pointer-events-auto opacity-70'
      : 'pointer-events-none h-0 w-0 opacity-0'
  }`}
/>
```

- [ ] **Step 2: Run unit tests**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run test:unit 2>&1 | tail -15
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/components/SideNav/index.tsx
git commit -m "a11y: add aria-label to SideNav overlay button"
```

---

### Task 10: Add `aria-label` to sidebar service links

**Files:**
- Modify: `src/components/SideNav/MenuLink.tsx`

**Context:** Service links (Más visto hoy, Denuncias, Avisos Legales, Calculadora Dólar, Horóscopo) are rendered in `SideNav` via `servicesMenu` with a custom `className`. They use the default `MenuLink` branch which renders an icon + text. The `item.name` is already rendered as text, so these links already have accessible text content. However, the Lighthouse report flags `<a class="relative z-10 flex flex-col gap-1">` anchors in the sidebar — these are the widget links (Avisos Legales, Denuncias, etc.) rendered by a different component.

- [ ] **Step 1: Find the exact components for the flagged links**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && grep -r "flex-col gap-1" src/components --include="*.tsx" -l
```

Read the result files to identify which component renders `<a class="relative z-10 flex flex-col gap-1">`.

- [ ] **Step 2: Add `aria-label` to the identified icon-only links**

Once the component is identified (likely a sidebar widget component), add `aria-label={item.name}` or the appropriate label to each `<a>` or `<Link>` that wraps only an icon with no visible text.

Example pattern — if the component renders:
```tsx
<a className='relative z-10 flex flex-col gap-1' href={href}>
  <Icon />
</a>
```

Change to:
```tsx
<a className='relative z-10 flex flex-col gap-1' href={href} aria-label={name}>
  <Icon />
</a>
```

- [ ] **Step 3: Run unit tests**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run test:unit 2>&1 | tail -15
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add -p
git commit -m "a11y: add aria-label to sidebar icon-only service links"
```

---

### Task 11: Fix heading hierarchy in MostVisitedPosts

**Files:**
- Modify: `src/components/MostVisitedPosts/index.tsx`

**Context:** `MostVisitedPosts` renders `<h5>` for the "LEÍDO" title. The `<h6>` in the footer description (`FOOTER_DESCRIPTION`) is rendered inside `<Footer>` as `<h6 className='pt-4 pr-4 leading-5'>`. That `<h6>` is descriptive text, not a subheading.

- [ ] **Step 1: Change `<h6>` to `<p>` in Footer**

In `src/components/Footer/index.tsx`, change:

```tsx
<h6 className='pt-4 pr-4 leading-5'>{FOOTER_DESCRIPTION}</h6>
```

to:

```tsx
<p className='pt-4 pr-4 leading-5'>{FOOTER_DESCRIPTION}</p>
```

- [ ] **Step 2: Run the Footer test**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx jest src/components/Footer --no-coverage 2>&1 | tail -15
```

If snapshot fails, update it:

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npx jest src/components/Footer --no-coverage -u 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next
git add src/components/Footer/index.tsx
git commit -m "a11y: replace non-sequential h6 with p in Footer description"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run test:unit 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Run full build**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run build 2>&1 | tail -30
```

Expected: successful build, no errors.

- [ ] **Run linter**

```bash
cd /Users/miguel/Projects/noticiascol/ncol-next && npm run lint 2>&1 | tail -20
```

Expected: zero warnings, zero errors.
