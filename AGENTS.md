# AGENTS.md - ncol-next Development Guide

## 🤖 Interaction Principles
- **Modularity**: Always use modular clients in `src/lib/api`.
- **Database**: Use Drizzle ORM for any Turso/LibSQL interactions.
- **Styling**: Adhere to Tailwind CSS v4 patterns and Radix UI primitives.
- **Testing**:
  - `jest` for unit tests.
  - `playwright` for E2E tests.
  - `storybook` for component documentation.

## ⚙️ Core Workflows
1. **Local Dev**: `npm run dev` for Next.js, `npm run sst:dev` for full-stack infrastructure.
2. **Linting**: `npm run lint` uses ESLint with strict rules.
3. **Deployment**: `npm run sst:deploy:production` (production) or `staging`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
