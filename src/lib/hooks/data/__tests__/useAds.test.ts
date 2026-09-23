import { pickAd, resolveAdLink } from '../useAds'
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
    deviceTarget: 'all',
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

describe('resolveAdLink', () => {
  const links = {
    link_url: 'https://example.com/legacy',
    link_url_desktop: 'https://example.com/desktop',
    link_url_ios: 'https://apps.apple.com/app',
    link_url_android: 'https://play.google.com/store/apps'
  }

  it('uses the iOS destination on iPhone and iPad', () => {
    expect(resolveAdLink(links, 'Mozilla/5.0 (iPhone)')).toBe(
      links.link_url_ios
    )
    expect(resolveAdLink(links, 'Mozilla/5.0 (iPad)')).toBe(links.link_url_ios)
  })

  it('uses the iOS destination for modern iPadOS desktop user agents', () => {
    const modernIpad =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'

    expect(resolveAdLink(links, modernIpad)).toBe(links.link_url_ios)
  })

  it('uses the Android destination on Android', () => {
    expect(resolveAdLink(links, 'Mozilla/5.0 (Linux; Android 15)')).toBe(
      links.link_url_android
    )
  })

  it('uses the desktop destination in desktop browsers', () => {
    expect(resolveAdLink(links, 'Mozilla/5.0 (Macintosh)')).toBe(
      links.link_url_desktop
    )
  })

  it('falls back to the legacy destination', () => {
    expect(
      resolveAdLink(
        { ...links, link_url_desktop: null, link_url_ios: null },
        'Mozilla/5.0 (iPhone)'
      )
    ).toBe(links.link_url)
  })
})
