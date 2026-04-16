import { pickAd } from '../useAds'
import type { ServedAd } from '../useAds'

function makeAd(overrides: Partial<ServedAd> = {}): ServedAd {
  return {
    id: 'ad-1',
    type: 'banner',
    imageUrl: 'https://example.com/img.png',
    imageUrlMobile: 'https://example.com/img-mobile.png',
    htmlContent: null,
    linkUrl: 'https://example.com',
    slot: 'header',
    ...overrides
  }
}

describe('pickAd', () => {
  it('returns null when ads is undefined', () => {
    expect(pickAd(undefined, 'header')).toBeNull()
  })

  it('returns null when ads array is empty', () => {
    expect(pickAd([], 'header')).toBeNull()
  })

  it('returns null when no ads match the slot', () => {
    const ads = [makeAd({ slot: 'sidebar' }), makeAd({ slot: 'footer' })]
    expect(pickAd(ads, 'header')).toBeNull()
  })

  it('returns the single matching ad', () => {
    const ad = makeAd({ slot: 'header' })
    const result = pickAd([ad], 'header')
    expect(result).toBe(ad)
  })

  it('picks an ad only from the matching slot', () => {
    const headerAd = makeAd({ id: 'h1', slot: 'header' })
    const sidebarAd = makeAd({ id: 's1', slot: 'sidebar' })
    const result = pickAd([headerAd, sidebarAd], 'header')
    expect(result).toBe(headerAd)
  })

  it('returns one of the matching ads when multiple exist', () => {
    const ad1 = makeAd({ id: 'a1', slot: 'sidebar' })
    const ad2 = makeAd({ id: 'a2', slot: 'sidebar' })
    const ad3 = makeAd({ id: 'a3', slot: 'sidebar' })
    const ads = [ad1, ad2, ad3]

    const results = new Set<string>()
    for (let i = 0; i < 50; i++) {
      const picked = pickAd(ads, 'sidebar')
      if (picked) results.add(picked.id)
    }
    // All picked results should be valid sidebar ads
    for (const id of results) {
      expect(['a1', 'a2', 'a3']).toContain(id)
    }
    // With 50 trials we expect more than one unique ad to be picked
    expect(results.size).toBeGreaterThan(1)
  })

  it('works with html type ads', () => {
    const ad = makeAd({
      slot: 'inline',
      type: 'html',
      imageUrl: null,
      imageUrlMobile: null,
      htmlContent: '<div>Ad</div>'
    })
    expect(pickAd([ad], 'inline')).toBe(ad)
  })
})
