'use client'

import { useMemo } from 'react'
import useSWR, { SWRConfiguration } from 'swr'
import { fetcher } from '@lib/utils/utils'

/**
 * Custom SWR hook that fetches data once per session using a nonce strategy.
 * The nonce is stored in sessionStorage and persists across component remounts
 * but resets when the user opens a new tab or closes the browser.
 * Cache is automatically cleared at midnight (when the date changes).
 *
 * @param baseUrl - The base API endpoint URL
 * @param storageKey - Unique key for sessionStorage (e.g., 'most_visited_nonce')
 * @param options - Additional SWR configuration options
 * @returns SWR response with data, isLoading, and error
 */
export function useSessionSWR<T>(
  baseUrl: string | null,
  storageKey: string,
  options?: SWRConfiguration<T>
) {
  const nonce = useMemo(() => {
    if (typeof window === 'undefined') return Date.now()

    const stored = window.sessionStorage.getItem(storageKey)
    const storedDate = window.sessionStorage.getItem(`${storageKey}_date`)
    const currentDate = new Date().toDateString()

    // If we have a stored nonce and it's from today, reuse it
    if (stored && storedDate === currentDate) {
      return Number(stored)
    }

    // Otherwise, generate a new nonce and store it with today's date
    const v = Date.now()
    window.sessionStorage.setItem(storageKey, String(v))
    window.sessionStorage.setItem(`${storageKey}_date`, currentDate)
    return v
  }, [storageKey])

  const key = useMemo(() => {
    if (!baseUrl) return null
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}_=${nonce}`
  }, [baseUrl, nonce])

  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours - prevents refetch with same key
    keepPreviousData: true,
    ...options
  })

  return {
    data,
    isLoading,
    error,
    mutate
  }
}
