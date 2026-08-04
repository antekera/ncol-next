'use client'

import useSWR from 'swr'
import type { OpinionAuthor } from '@app/actions/getOpinionAuthors'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useOpinionAuthors() {
  const { data, error, isLoading } = useSWR<OpinionAuthor[]>(
    '/api/opinion/authors',
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  return { authors: data ?? [], error, isLoading }
}
