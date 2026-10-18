import type { ReadingOrigin } from './reading'

let remember: ((destination: string, origin: ReadingOrigin) => void) | undefined

/** Optional synchronous handoff; no storage or transport in the default path. */
export function rememberReadingClick(
  destination: string,
  origin: ReadingOrigin
) {
  remember?.(destination, origin)
}

export function connectReadingClicks(callback: NonNullable<typeof remember>) {
  remember = callback
  return () => {
    if (remember === callback) remember = undefined
  }
}
