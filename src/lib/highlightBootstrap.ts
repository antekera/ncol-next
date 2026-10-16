// Runs synchronously in <head>, before SSR article highlights can be painted.
export const HIGHLIGHT_BOOTSTRAP_SCRIPT = `
if (typeof window.IntersectionObserver === 'function') {
  document.documentElement.dataset.ncolHighlights = 'animate';
}
`
