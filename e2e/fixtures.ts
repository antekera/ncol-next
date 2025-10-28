// Centralized Playwright exports with environment polyfills applied first.
// Avoid top-level await so specs don't require ESM module mode.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const web = require('stream/web')
  if (web) {
    if (!globalThis.TransformStream && web.TransformStream) {
      globalThis.TransformStream = web.TransformStream
    }
    if (!globalThis.ReadableStream && web.ReadableStream) {
      globalThis.ReadableStream = web.ReadableStream
    }
    if (!globalThis.WritableStream && web.WritableStream) {
      globalThis.WritableStream = web.WritableStream
    }
  }
} catch {
  // ignore if not available
}

// Import Playwright after polyfills are set up
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pw = require('@playwright/test')
export const { test, expect, devices } = pw as typeof import('@playwright/test')
