'use client'
import useSWRImmutable from 'swr/immutable'
import { useMemo } from 'react'

import { Skeleton } from '@components/ui/skeleton'
import { fetcher } from '@lib/utils/utils'
import ContextStateData from '@lib/context/StateContext'
import { MostRecentPostBanner } from '@blocks/content/MostRecentPostBanner'
import { Container } from '@components/Container'

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
  const { data, isLoading } = useSWRImmutable<Response[]>(
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

  return (
    <div className='border-b dark:border-neutral-500'>
      <Container className='flex h-[40px] flex-nowrap justify-start gap-2 overflow-x-auto px-6 py-2 pr-8 font-sans text-sm whitespace-nowrap sm:pr-0 md:px-8'>
        <span className='flex items-center gap-1'>
          <strong className='font-semibold'>Dólar BCV:</strong>$
          <div className='w-14 flex-shrink-0'>
            {isLoading ? (
              <Skeleton className='h-4 w-2 w-full rounded' />
            ) : (
              mostRecent && (
                <>
                  {mostRecent.price.toFixed(2)}
                  {symbol && (
                    <span
                      className={
                        symbol === '▲' ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {symbol}
                    </span>
                  )}
                </>
              )
            )}
          </div>
        </span>
        <MostRecentPostBanner />
      </Container>
    </div>
  )
}
