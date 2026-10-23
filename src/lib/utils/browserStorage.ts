/**
 * Browser privacy modes and embedded WebViews can expose `window` while
 * throwing when either storage property is accessed. Keep optional UI state
 * functional without allowing those platform failures to escape as errors.
 */
export function getBrowserStorage(kind: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function getStorageItem(
  kind: 'local' | 'session',
  key: string
): string | null {
  try {
    return getBrowserStorage(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function setStorageItem(
  kind: 'local' | 'session',
  key: string,
  value: string
): void {
  try {
    getBrowserStorage(kind)?.setItem(key, value)
  } catch {
    // Storage is optional for these client-side preferences and caches.
  }
}

export function removeStorageItem(
  kind: 'local' | 'session',
  key: string
): void {
  try {
    getBrowserStorage(kind)?.removeItem(key)
  } catch {
    // Storage is optional for these client-side preferences and caches.
  }
}

export function getStorageKeys(kind: 'local' | 'session'): string[] {
  try {
    const storage = getBrowserStorage(kind)
    if (!storage) return []

    const keys: string[] = []
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key !== null) keys.push(key)
    }
    return keys
  } catch {
    // A readable Storage object can still reject enumeration in privacy modes.
    return []
  }
}
