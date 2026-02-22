import { useSessionSWR } from '@lib/hooks/useSessionSWR'

export interface HoroscopoData {
  id: number
  signo: string
  nombre: string
  semana_inicio: string
  semana_fin: string
  introduccion: string
  amor: string
  riqueza: string
  bienestar: string
  created_at: string
}

/**
 * Hook to fetch a specific signo horoscope.
 * Uses session-based caching with signo-specific storage key.
 * @param signo - The zodiac sign slug (e.g., 'aries', 'cancer')
 */
export function useHoroscopo(signo: string | null) {
  // On Sundays (transition day), we refresh the cache key every hour to ensure
  // users get the latest week range as soon as it's published.
  const isSunday = new Date().getDay() === 0
  const hourlyNonce = isSunday ? `_${new Date().getHours()}` : ''

  const { data, error, isLoading, mutate } = useSessionSWR<HoroscopoData>(
    signo ? `/api/horoscopo/${signo}/` : null,
    signo ? `horoscopo_${signo}${hourlyNonce}_nonce` : 'horoscopo_null_nonce'
  )

  return {
    horoscopo: data ?? null,
    error,
    isLoading,
    mutate
  }
}
