'use client'
import useSWRImmutable from 'swr/immutable'
import { useMemo } from 'react'

import { Skeleton } from '@components/ui/skeleton'
import { fetcher } from '@lib/utils/utils'
import ContextStateData from '@lib/context/StateContext'

interface Response {
  id: string
  source: string
  price: number
  last_update: string
  fetched_at: string
}

const TWO_DAYS = 1000 * 60 * 60 * 24 * 2

export const ExchangeRateBanner = () => {
  const { today } = ContextStateData()
  const { data, error, isLoading } = useSWRImmutable<Response[]>(
    '/api/dolar/',
    fetcher
  )

  const { mostRecent, symbol } = useMemo(() => {
    const [mostRecent, previous] = (data ?? [])
      .map(item => ({ ...item, parsedDate: new Date(item.last_update) }))
      .filter(
        item => Math.abs(today.getTime() - item.parsedDate.getTime()) < TWO_DAYS
      )
      .filter(item => item.id === 'oficial')
      .sort(
        (a, b) =>
          new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
      )

    const getPriceSymbol = (
      current: typeof mostRecent,
      prev: typeof previous
    ) => {
      if (!current || !prev) return ''
      if (current.price > prev.price) return '▲'
      if (current.price < prev.price) return '▼'
      return ''
    }

    const symbol = getPriceSymbol(mostRecent, previous)

    return { mostRecent, symbol }
  }, [data, today])

  if (error)
    return (
      <div className='flex h-[37px] border-b py-2 dark:border-neutral-500' />
    )

  if (isLoading) return <Loading />

  return (
    <div className='flex h-[40px] flex-nowrap justify-start gap-4 overflow-x-auto border-b py-2 pr-8 pl-6 font-sans text-sm whitespace-nowrap sm:justify-center sm:pr-0 sm:pl-0 dark:border-neutral-500'>
      {mostRecent && (
        <span className='flex items-center gap-1'>
          <strong className='font-semibold'>Dólar BCV:</strong>$
          {mostRecent.price.toFixed(2)}
          {symbol && (
            <span
              className={symbol === '▲' ? 'text-green-600' : 'text-red-600'}
            >
              {symbol}
            </span>
          )}
          <span className='sm:hidden'>|</span>
        </span>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className='flex h-[40px] flex-nowrap items-center justify-start gap-4 overflow-x-auto border-b py-2 pr-8 pl-6 font-sans text-sm whitespace-nowrap sm:justify-center sm:pr-0 sm:pl-0 dark:border-neutral-500'>
      <div className='w-28 flex-shrink-0'>
        <Skeleton className='h-4 w-full rounded' />
      </div>
    </div>
  )
}
