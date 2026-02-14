# Coding Rules and Guidelines

To ensure code quality and pass linter checks, follow these rules:

## 1. Clean Conditionals
- **No Nested Ternaries:** Avoid nested ternary operators, especially within JSX. They are hard to read and trigger `sonarjs/no-nested-conditional`.
  - *Bad:* `{condition1 ? (condition2 ? A : B) : C}`
  - *Good:* Use early returns, separate variables, or dedicated components to handle complex logic.

## 2. Safe Array Operations
- **No Misleading Sort:** Do not use `.sort()` directly on arrays that might be perceived as immutable or where the linter flags it as misleading. Use the spread operator to create a copy first.
  - *Bad:* `const sorted = data.sort(...)`
  - *Good:* `const sorted = [...data].sort(...)` or `data.toSorted(...)` (satisfies `sonarjs/no-misleading-array-reverse`).

## 3. Production Logging
- **No Console Statements:** Avoid `console.log`, `console.error`, and `console.warn` in production code. Use a proper logging utility if available, or remove them before committing (satisfies `no-console`).
- **Unused Exception Variables:** When catching an exception but not using the error object, use `catch { ... }` instead of `catch (error) { ... }` to avoid `@typescript-eslint/no-unused-vars`.

## 4. Randomness and Security
- **PRNG Safety:** When generating random values for UI elements (like stars in a canvas), if the linter flags `Math.random()`, use `window.crypto.getRandomValues()` for higher entropy (satisfies `sonarjs/pseudo-random`).
- **Object Injection:** Avoid dynamic property access using unvalidated keys. Cast keys to specific literal types or use a defensive approach to satisfy `security/detect-object-injection`.
  - *Example:* `const value = object[key as keyof typeof object]`

## 5. Async Event Handlers
- **No Misused Promises:** When passing an async function to a property that expects a void return (like `onClick`), wrap it in an arrow function.
  - *Bad:* `onClick={handleAsync}`
  - *Good:* `onClick={() => { void handleAsync() }}` (satisfies `@typescript-eslint/no-misused-promises`).

## 6. Logic Optimization
- **No Duplicated Branches:** Do not have identical code blocks in different branches of an `if/else` or `switch` statement. Merge them into a single logic path (satisfies `sonarjs/no-duplicated-branches`).
