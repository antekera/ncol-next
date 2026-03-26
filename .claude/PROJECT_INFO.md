# GEMINI.md - ncol-next

## 🚀 Overview
**ncol-next** is the primary news frontend for NoticiasCol. It is built using modern web technologies focused on performance, SEO, and developer experience.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Deployment**: SST (Serverless Stack) on AWS
- **Styling**: Tailwind CSS v4 + Radix UI
- **Database**: Drizzle ORM (Turso/LibSQL)
- **Observability**: Sentry + Logtail
- **Email**: Resend
- **Testing**: Jest (Unit), Playwright (E2E), Storybook (Components)

## 📡 Data Architecture
- **Content Origin**: WordPress (GraphQL/REST) fetched via custom API clients in `src/lib/api`.
- **Local State**: SWR for data fetching and caching.
- **Theming**: `next-themes` for Dark/Light mode support.

---

# AGENTS.md - Development Guide

## 🤖 AI Interaction Guidelines
- **Modularity**: Always use the modular client pattern in `src/lib/api` for external data.
- **Database**: Use Drizzle ORM for any local database interactions.
- **SEO**: Adhere to the metadata patterns in `src/app`.
- **Components**: Follow the Radix UI + Tailwind 4 patterns. Use `class-variance-authority` (CVA) for component variants.
- **Testing**:
  - Add unit tests for logic in `src/lib`.
  - Add Playwright tests for critical user journeys.
  - Create Storybook stories for new UI components.

## 🏗️ Deployment
- Use `npm run sst:dev` for local infrastructure development.
- Deployments are managed via SST: `npm run sst:deploy:staging` or `production`.
