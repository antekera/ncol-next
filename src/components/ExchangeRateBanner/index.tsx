'use client'

import { useMemo } from 'react'
import { Skeleton } from '@components/ui/skeleton'
import { MostRecentPostBanner } from '@blocks/content/MostRecentPostBanner'
import { Container } from '@components/Container'
import useSWR from 'swr'
import { BCV_API_URL, BcvResponse, bcvFetcher } from '@lib/api/BcvRatesClient'

export const ExchangeRateBanner = () => {
  const { data, isLoading } = useSWR<BcvResponse>(BCV_API_URL, bcvFetcher, {
    refreshInterval: 60 * 60 * 1000,
    revalidateOnFocus: false
  })

  const { rate, symbol } = useMemo(() => {
    if (!data) return { rate: null, symbol: '' }
    const pct = data.changePercentage.usd
    let sym = ''
    if (pct > 0) sym = '▲'
    else if (pct < 0) sym = '▼'
    return { rate: data.current.usd, symbol: sym }
  }, [data])

  return (
    <div className='border-b dark:border-neutral-500'>
      <Container className='flex h-[40px] flex-nowrap justify-start gap-2 overflow-hidden px-6 py-2 pr-8 font-sans text-sm sm:pr-0 md:px-8'>
        <span className='flex items-center gap-1'>
          <div className='font-semibold whitespace-nowrap'>Dólar BCV:</div>$
          <div className='w-14 flex-shrink-0'>
            {isLoading ? (
              <Skeleton className='h-4 w-full rounded' />
            ) : (
              rate && (
                <>
                  {rate.toFixed(2)}
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
