import { BaseClient } from './BaseClient'
import { ADS_ENABLED } from '@lib/config'
import type { HttpClient } from '@lib/httpClient'

export interface ServedAd {
  id: string
  type: 'banner' | 'html' | 'adsense' | 'third_party'
  imageUrl: string | null
  imageUrlMobile: string | null
  htmlContent: string | null
  linkUrl: string | null
  slot: string
  deviceTarget: 'all' | 'mobile' | 'desktop'
  unitId?: string
  providerKey?: string
  containerClass?: string
}

interface RawSlotFallback {
  slot: string
  provider: string
  provider_key: string | null
  container_class: string | null
  unit_id: string | null
}

const ADSENSE_UNSUPPORTED_SLOTS = new Set(['popup', 'sticky-bottom'])
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(
  /\/$/,
  ''
)
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export function parseSlotFallbacks(
  rows: unknown,
  eligibleSlots: readonly string[]
): ServedAd[] {
  if (!Array.isArray(rows)) return []

  return rows.flatMap<ServedAd>((row: unknown) => {
    if (
      typeof row !== 'object' ||
      row === null ||
      !('slot' in row) ||
      !('provider' in row) ||
      !('provider_key' in row) ||
      !('container_class' in row) ||
      !('unit_id' in row)
    ) {
      return []
    }

    const setting = row as RawSlotFallback
    if (
      typeof setting.slot !== 'string' ||
      !eligibleSlots.includes(setting.slot)
    ) {
      return []
    }

    if (
      setting.provider === 'adsense' &&
      !ADSENSE_UNSUPPORTED_SLOTS.has(setting.slot) &&
      /^\d{10}$/.test(setting.unit_id ?? '')
    ) {
      return [
        {
          id: `adsense-${setting.slot}`,
          type: 'adsense',
          imageUrl: null,
          imageUrlMobile: null,
          htmlContent: null,
          linkUrl: null,
          slot: setting.slot,
          deviceTarget: 'all',
          unitId: setting.unit_id!
        }
      ]
    }

    if (
      setting.provider === 'third_party' &&
      typeof setting.provider_key === 'string' &&
      /^[a-z][a-z0-9_-]{0,31}$/.test(setting.provider_key) &&
      typeof setting.container_class === 'string' &&
      /^[A-Za-z_][A-Za-z0-9_-]{0,63}$/.test(setting.container_class)
    ) {
      return [
        {
          id: `third-party-${setting.slot}`,
          type: 'third_party',
          imageUrl: null,
          imageUrlMobile: null,
          htmlContent: null,
          linkUrl: null,
          slot: setting.slot,
          deviceTarget: 'all',
          providerKey: setting.provider_key,
          containerClass: setting.container_class
        }
      ]
    }

    return []
  })
}

export class AdsClient extends BaseClient {
  private readonly supabaseUrl: string
  private readonly supabaseAnonKey: string

  constructor(
    client: HttpClient,
    supabaseUrl = SUPABASE_URL,
    supabaseAnonKey = SUPABASE_ANON_KEY
  ) {
    super(client)
    this.supabaseUrl = supabaseUrl.replace(/\/$/, '')
    this.supabaseAnonKey = supabaseAnonKey
  }

  /**
   * Fetches active ads from the preferred data source (WP or custom API)
   */
  async getActiveAds() {
    // Placeholder logic - to be implemented when the Ads API is ready
    return this.post({ query: '{ ads { nodes { id title } } }' })
  }

  async getSlotFallbacks(
    eligibleSlots: readonly string[]
  ): Promise<ServedAd[]> {
    if (
      !ADS_ENABLED ||
      !this.supabaseUrl ||
      !this.supabaseAnonKey ||
      eligibleSlots.length === 0
    ) {
      return []
    }

    const response = await this.client.get<unknown>(
      `${this.supabaseUrl}/rest/v1/ad_slot_fallbacks_public`,
      {
        params: {
          select: 'slot,provider,provider_key,container_class,unit_id',
          slot: `in.(${eligibleSlots.join(',')})`
        },
        headers: {
          apikey: this.supabaseAnonKey,
          Authorization: `Bearer ${this.supabaseAnonKey}`
        },
        revalidate: 0
      }
    )

    if (response.error || !Array.isArray(response.data)) return []
    return parseSlotFallbacks(response.data, eligibleSlots)
  }
}
