import { AdsClient, parseSlotFallbacks } from '../AdsClient'
import type { HttpClient, HttpResponse } from '@lib/httpClient'

const ok = <T>(data: T): HttpResponse<T> => ({ data, status: 200 })

const thirdPartyRow = {
  slot: 'sidebar',
  provider: 'third_party',
  provider_key: 'clever',
  container_class: 'clever-core-ads',
  unit_id: null
}

describe('parseSlotFallbacks', () => {
  test('rejects AdSense in overlay slots while allowing third-party fallback', () => {
    expect(
      parseSlotFallbacks(
        [
          {
            slot: 'popup',
            provider: 'adsense',
            provider_key: null,
            container_class: null,
            unit_id: '1234567890'
          },
          { ...thirdPartyRow, slot: 'popup' }
        ],
        ['popup']
      )
    ).toEqual([
      {
        id: 'third-party-popup',
        type: 'third_party',
        imageUrl: null,
        imageUrlMobile: null,
        htmlContent: null,
        linkUrl: null,
        slot: 'popup',
        deviceTarget: 'all',
        providerKey: 'clever',
        containerClass: 'clever-core-ads'
      }
    ])
  })
})

describe('AdsClient.getSlotFallbacks', () => {
  test('requests the public fallback view and parses its response', async () => {
    const get = jest.fn().mockResolvedValue(ok([thirdPartyRow]))
    const client = new AdsClient(
      { get, post: jest.fn() } as unknown as HttpClient,
      'https://example.supabase.co',
      'anon-key'
    )

    await expect(client.getSlotFallbacks(['sidebar'])).resolves.toEqual([
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
      }
    ])
    expect(get).toHaveBeenCalledWith(
      'https://example.supabase.co/rest/v1/ad_slot_fallbacks_public',
      {
        params: {
          select: 'slot,provider,provider_key,container_class,unit_id',
          slot: 'in.(sidebar)'
        },
        headers: {
          apikey: 'anon-key',
          Authorization: 'Bearer anon-key'
        },
        revalidate: 0
      }
    )
  })
})
