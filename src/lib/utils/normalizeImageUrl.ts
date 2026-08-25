/**
 * Converts a WordPress srcset value to a concrete image URL.
 */
export function normalizeImageUrl(
  value: string | null | undefined
): string | null {
  if (!value) return null

  const firstCandidate = value.split(',')[0]?.trim()
  const url = firstCandidate?.split(/\s+/)[0]

  return url || null
}
