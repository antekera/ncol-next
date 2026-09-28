import { getEmptyAdSlots, pickAd, resolveAdLink } from '../useAds'
import * as useAdsModule from '../useAds'
import type { ServedAd } from '../useAds'

const parseSlotFallbacks =
  (
    useAdsModule as unknown as {
      parseSlotFallbacks?: (
        rows: unknown,
        eligibleSlots: readonly string[]
      ) => ServedAd[]
    }
  ).parseSlotFallbacks ?? (() => [])

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

  it('uses a configured third-party fallback when there is no campaign', () => {
    const fallback = {
      ...makeAd({
        id: 'third-party-sidebar',
        slot: 'sidebar'
      }),
      type: 'third_party',
      providerKey: 'clever',
      containerClass: 'clever-core-ads'
    } as unknown as ServedAd

    expect(pickAd([fallback], 'sidebar')).toBe(fallback)
    expect(pickAd([fallback], 'header')).toBeNull()
  })

  it('always gives an active direct campaign priority over a third-party fallback', () => {
    const fallback = {
      ...makeAd({
        id: 'third-party-sidebar',
        slot: 'sidebar'
      }),
      type: 'third_party',
      providerKey: 'clever',
      containerClass: 'clever-core-ads'
    } as unknown as ServedAd
    const campaign = makeAd({ id: 'campaign-sidebar', slot: 'sidebar' })
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0)

    expect(pickAd([fallback, campaign], 'sidebar')).toBe(campaign)
    randomSpy.mockRestore()
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

describe('getEmptyAdSlots', () => {
  it('does not count campaigns targeted to another device as occupying a slot', () => {
    expect(
      getEmptyAdSlots(
        [
          { slot: 'sidebar', device_target: 'desktop' },
          { slot: 'header', device_target: 'all' }
        ],
        'mobile'
      )
    ).toContain('sidebar')
  })
})

describe('parseSlotFallbacks', () => {
  it('maps only requested valid AdSense and third-party rows', () => {
    expect(
      parseSlotFallbacks(
        [
          {
            slot: 'sidebar',
            provider: 'third_party',
            provider_key: 'clever',
            container_class: 'clever-core-ads',
            unit_id: null
          },
          {
            slot: 'header',
            provider: 'adsense',
            provider_key: null,
            container_class: null,
            unit_id: '1719799365'
          },
          {
            slot: 'footer',
            provider: 'third_party',
            provider_key: 'other',
            container_class: 'provider-target',
            unit_id: null
          },
          {
            slot: 'inline',
            provider: 'third_party',
            provider_key: 'clever',
            container_class: 'clever-core-ads other',
            unit_id: null
          }
        ],
        ['sidebar', 'header']
      )
    ).toEqual([
      {
        id: 'third-party-sidebar',
        type: 'third_party',
        imageUrl: null,
        imageUrlMobile: null,
        htmlContent: null,
        linkUrl: null,
        slot: 'sidebar',
        deviceTarget: 'all',
        providerKey: 'clever',
        containerClass: 'clever-core-ads'
      },
      {
        id: 'adsense-header',
        type: 'adsense',
        imageUrl: null,
        imageUrlMobile: null,
        htmlContent: null,
        linkUrl: null,
        slot: 'header',
        deviceTarget: 'all',
        unitId: '1719799365'
      }
    ])
  })

  it('fails closed for malformed response data', () => {
    expect(parseSlotFallbacks({ slot: 'sidebar' }, ['sidebar'])).toEqual([])
  })
})
