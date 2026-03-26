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
