import type { HomeArticle } from './types'

function imageUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
      ? url
      : null
  } catch {
    return null
  }
}

export function getHomeImage(
  image: HomeArticle['featuredImage'],
  targetWidth: number
) {
  const original = image?.node?.sourceUrl && imageUrl(image.node.sourceUrl)
  if (!original) return null
  const candidates = (image?.node.srcSet ?? '')
    .split(',')
    .flatMap(entry => {
      const [value, descriptor] = entry.trim().split(/\s+/)
      const url = imageUrl(value)
      const width = descriptor?.endsWith('w')
        ? Number(descriptor.slice(0, -1))
        : 0
      if (
        !url ||
        url.hostname !== original.hostname ||
        !Number.isInteger(width) ||
        width < 1 ||
        width > 16384
      )
        return []
      return [{ src: url.href, width }]
    })
    .sort((a, b) => a.width - b.width)
  const selected = candidates.find(candidate => candidate.width >= targetWidth)
  const originalIsLargeEnough =
    (image?.node.mediaDetails?.width ?? 0) >= targetWidth
  return {
    src:
      selected?.src ??
      (originalIsLargeEnough ? original.href : candidates.at(-1)?.src) ??
      original.href,
    srcSet: candidates.length
      ? candidates
          .map(candidate => `${candidate.src} ${candidate.width}w`)
          .join(', ')
      : undefined
  }
}
