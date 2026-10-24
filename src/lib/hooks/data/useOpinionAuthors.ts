'use client'

import useSWR from 'swr'
import type { OpinionAuthor } from '@app/actions/getOpinionAuthors'

const fetcher = async (url: string): Promise<OpinionAuthor[]> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Opinion authors unavailable')
  const authors = await response.json()
  if (!Array.isArray(authors))
    throw new Error('Invalid opinion authors response')
  return authors
}

export function useOpinionAuthors({ enabled = true } = {}) {
  const { data, error, isLoading } = useSWR<OpinionAuthor[]>(
    enabled ? '/api/opinion/authors' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 60 * 1000
    }
  )

  return { authors: data ?? [], error, isLoading }
}
