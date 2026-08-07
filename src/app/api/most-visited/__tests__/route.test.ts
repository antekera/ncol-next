import { normalizeImageUrl } from '@lib/utils/normalizeImageUrl'

describe('normalizeImageUrl', () => {
  it('extracts a concrete URL from legacy srcset data', () => {
    expect(
      normalizeImageUrl(
        'https://cdn.noticiascol.com/post-373x210.webp 373w, https://cdn.noticiascol.com/post.webp 1024w'
      )
    ).toBe('https://cdn.noticiascol.com/post-373x210.webp')
  })

  it('keeps a single image URL unchanged', () => {
    expect(normalizeImageUrl('https://cdn.noticiascol.com/post.webp')).toBe(
      'https://cdn.noticiascol.com/post.webp'
    )
  })
})
