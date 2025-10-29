// Polyfill WHATWG streams for environments where they are missing.
// Some Playwright internals and dependencies expect TransformStream to exist.
export default async function globalSetup() {
  try {
    const web = await import('stream/web')
    if (!(globalThis as any).TransformStream && (web as any).TransformStream) {
      ;(globalThis as any).TransformStream = (web as any).TransformStream
    }
    if (!(globalThis as any).ReadableStream && (web as any).ReadableStream) {
      ;(globalThis as any).ReadableStream = (web as any).ReadableStream
    }
    if (!(globalThis as any).WritableStream && (web as any).WritableStream) {
      ;(globalThis as any).WritableStream = (web as any).WritableStream
    }
  } catch {
    // ignore if polyfill cannot be applied
  }
}
