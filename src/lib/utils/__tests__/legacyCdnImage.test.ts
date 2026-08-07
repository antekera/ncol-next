import { getLegacyCdnImageUrl } from '../legacyCdnImage'

describe('getLegacyCdnImageUrl', () => {
  it('returns the original legacy CDN URL from a Next optimizer request', () => {
    const source =
      'https://cdn.noticiascol.com/wp-content/uploads/2021/02/EuTIQ4uXEAMxMmy.jpeg'
    const optimizerUrl = `https://www.noticiascol.com/_next/image?url=${encodeURIComponent(source)}&w=640&q=75`

    expect(getLegacyCdnImageUrl(optimizerUrl)).toBe(source)
  })

  it('does not redirect optimizer requests for another host or malformed URLs', () => {
    expect(
      getLegacyCdnImageUrl(
        'https://www.noticiascol.com/_next/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg'
      )
    ).toBeNull()
    expect(getLegacyCdnImageUrl('not a URL')).toBeNull()
  })
})
