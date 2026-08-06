export const BCV_API_URL = 'https://rates.dolarvzla.com/bcv/current.json'

export interface BcvResponse {
  current: { date: string; usd: number; eur: number }
  previous: { date: string; usd: number; eur: number }
  changePercentage: { usd: number; eur: number }
}

export const bcvFetcher = (url: string): Promise<BcvResponse> =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error(`BCV API error: ${res.status}`)
    return res.json()
  })

export const BCV_SWR_OPTIONS = {
  refreshInterval: 60 * 60 * 1000,
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60 * 60 * 1000
} as const
