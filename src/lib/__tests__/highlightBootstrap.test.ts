import { runInNewContext } from 'node:vm'
import { HIGHLIGHT_BOOTSTRAP_SCRIPT } from '../highlightBootstrap'

test('enables hidden SSR markers before React when the browser can observe them', () => {
  const dataset: Record<string, string> = {}
  // eslint-disable-next-line sonarjs/code-eval -- Execute only the static bootstrap in an isolated browser stub.
  runInNewContext(HIGHLIGHT_BOOTSTRAP_SCRIPT, {
    window: { IntersectionObserver: function () {} },
    document: { documentElement: { dataset } }
  })
  expect(dataset.ncolHighlights).toBe('animate')
})

test('keeps the static SSR fallback when IntersectionObserver is unavailable', () => {
  const dataset: Record<string, string> = {}
  // eslint-disable-next-line sonarjs/code-eval -- Execute only the static bootstrap in an isolated browser stub.
  runInNewContext(HIGHLIGHT_BOOTSTRAP_SCRIPT, {
    window: {},
    document: { documentElement: { dataset } }
  })
  expect(dataset.ncolHighlights).toBeUndefined()
})
