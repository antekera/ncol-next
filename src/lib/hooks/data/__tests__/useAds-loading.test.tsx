import { act, renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useAds } from '../useAds'
import type { ServedAd } from '../useAds'

jest.mock('@lib/api', () => ({
  adsClient: {
    getSlotFallbacks: (slots: readonly string[]) => mockFallbacks(slots)
  }
}))

const mockFallbacks = jest.fn<Promise<ServedAd[]>, [readonly string[]]>()
const slots = [
  'header',
  'sidebar',
  'article-top',
  'article-bottom',
  'footer',
  'inline',
  'popup',
  'sticky-bottom'
]
const campaign = (slot: string, device = 'all') => ({
  id: `direct-${slot}-${device}`,
  type: 'banner',
  slot,
  device_target: device,
  image_url: '/ad.png',
  image_url_mobile: '/mobile.png',
  html_content: null,
  link_url: '/destination/',
  link_url_desktop: null,
  link_url_ios: null,
  link_url_android: null
})
const sidebar: ServedAd = {
  id: 'third-party-sidebar',
  type: 'third_party',
  slot: 'sidebar',
  deviceTarget: 'all',
  imageUrl: null,
  imageUrlMobile: null,
  htmlContent: null,
  linkUrl: null,
  providerKey: 'clever',
  containerClass: 'clever-core-ads'
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
}

describe('shared ad loading', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [campaign('sticky-bottom')]
    })
    mockFallbacks.mockResolvedValue([])
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('exposes direct creatives while unrelated configuration is held and shares both requests', async () => {
    let release!: (ads: ServedAd[]) => void
    mockFallbacks.mockReturnValue(
      new Promise(resolve => {
        release = resolve
      })
    )
    const { result } = renderHook(() => [useAds(), useAds(), useAds()], {
      wrapper
    })
    await waitFor(() => expect(mockFallbacks).toHaveBeenCalledTimes(1))
    expect(result.current[0].data?.[0].id).toBe('direct-sticky-bottom-all')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    await act(async () => release([sidebar]))
    await waitFor(() =>
      expect(result.current.every(value => value.data?.length === 2)).toBe(true)
    )
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(mockFallbacks).toHaveBeenCalledTimes(1)
    expect(mockFallbacks.mock.calls[0][0]).not.toContain('sticky-bottom')
  })

  it('does not request configuration when all slots have direct campaigns', async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => slots.map(slot => campaign(slot))
    } as Response)
    const { result } = renderHook(useAds, { wrapper })
    await waitFor(() => expect(result.current.data).toHaveLength(8))
    expect(mockFallbacks).not.toHaveBeenCalled()
  })

  it('keeps direct creatives when optional configuration fails', async () => {
    mockFallbacks.mockRejectedValue(
      new Error('optional configuration unavailable')
    )
    const { result } = renderHook(useAds, { wrapper })
    await waitFor(() =>
      expect(result.current.data?.[0].id).toBe('direct-sticky-bottom-all')
    )
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('requests fallback for slots occupied only on the other device', async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => [campaign('sidebar', 'mobile')]
    } as Response)
    const { result } = renderHook(useAds, { wrapper })
    await waitFor(() => expect(mockFallbacks).toHaveBeenCalledTimes(1))
    expect(mockFallbacks.mock.calls[0][0]).toContain('sidebar')
    expect(result.current.data).toEqual([])
  })

  it('does not request fallback after an unsuccessful direct response', async () => {
    jest.mocked(global.fetch).mockResolvedValue({ ok: false } as Response)
    const { result } = renderHook(useAds, { wrapper })
    await waitFor(() => expect(result.current.data).toEqual([]))
    expect(mockFallbacks).not.toHaveBeenCalled()
  })
})
