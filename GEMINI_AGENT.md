# Project Context for Gemini Agents

## Project Overview
**Name:** ncol-next
**Description:** A Next.js application (likely a news or content site based on "Noticiascol" context) using TypeScript, Tailwind CSS, and various modern web technologies.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (using `@theme`, `@apply`, etc.)
- **Database/ORM:** Drizzle ORM with LibSQL
- **Deployment:** SST (Serverless Stack)
- **Testing:** Jest (Unit), Playwright (E2E), Storybook (Components)
- **Linting/Formatting:** ESLint, Prettier

## Project Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable React components.
- `src/lib`: Utility functions, constants, and shared logic.
- `src/blocks`: Likely content blocks or larger UI sections.
- `src/providers`: React context providers.
- `public`: Static assets.
- `.sst`: SST configuration and state.

## Key Conventions
- **Path Aliases:**
  - `@app/*` -> `src/app/*`
  - `@components/*` -> `src/components/*`
  - `@lib/*` -> `src/lib/*`
  - `@blocks/*` -> `src/blocks/*`
  - `@providers/*` -> `src/providers/*`
- **Code Style:**
  - Strict TypeScript usage.
  - Prettier for formatting.
  - ESLint with Next.js, Airbnb TypeScript, and Tailwind plugins.
  - Functional components with hooks.
  - `cn` utility (likely `clsx` + `tailwind-merge`) for class names.

## Development Workflow
- **Run Dev Server:** `npm run dev` (or `nr dev`)
- **Build:** `npm run build`
- **Test:** `npm run test:unit` / `npm run test:e2e`
- **Lint:** `npm run lint`
- **Storybook:** `npm run storybook:start`

## Agent Instructions
When working on this codebase:
1. **Prefer TypeScript:** Always use strict types. Avoid `any`.
2. **Use Tailwind CSS:** Use utility classes for styling. Check `tailwind.json` or CSS files for custom themes if needed.
3. **Follow Directory Structure:** Place new components in `src/components`, pages in `src/app`, etc.
4. **Use Path Aliases:** Always use `@components`, `@lib`, etc. instead of relative paths like `../../`.
5. **Component Design:** Create small, reusable components. Use Storybook if applicable.
6. **State Management:** Use React Context or SWR for data fetching/state.
7. **Testing:** Write unit tests for logic and components where appropriate.

## Recent Issues/Fixes
- **Circular Dependencies:** Be aware of circular dependencies in `components` (e.g., `Header` vs `styles`). Extract types to `types.ts` or `utils.ts` to resolve them.
- **No Require:** Do not use `require()` style imports. Use ES6 `import` or dynamic `import()` instead.
