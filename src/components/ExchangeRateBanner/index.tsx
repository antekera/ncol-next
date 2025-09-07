'use client'
import useSWRImmutable from 'swr/immutable'
import { parse } from 'date-fns'
import { Skeleton } from '@components/ui/skeleton'
import { fetcher } from '@lib/utils/utils'
import ContextStateData from '@lib/context/StateContext'

interface Response {
  id: string
  source: string
  price: number
  symbol: string
  last_update: string
}

const TWO_DAYS = 1000 * 60 * 60 * 24 * 2

export const ExchangeRateBanner = () => {
  const { today } = ContextStateData()
  const { data, error, isLoading } = useSWRImmutable<Response[]>(
    '/api/dolar/',
    fetcher
  )

  if (error)
    return (
      <div className='flex h-[37px] border-b py-2 dark:border-neutral-500' />
    )

  if (isLoading) return <Loading />

  const parsedData = (data ?? []).map(item => ({
    ...item,
    parsedDate: parse(item.last_update, 'dd/MM/yyyy, hh:mm a', new Date())
  }))

  const validEntries = parsedData.filter(
    item => Math.abs(today.getTime() - item.parsedDate.getTime()) < TWO_DAYS
  )

  const bcv = validEntries.find(item => item.id === 'bcv')
  const bcvEuro = validEntries.find(item => item.id === 'bcv_euro')

  return (
    <div className='flex h-[37px] flex-nowrap justify-start gap-4 overflow-x-auto border-b py-2 pr-8 pl-6 font-sans text-sm whitespace-nowrap sm:justify-center sm:pr-0 sm:pl-0 dark:border-neutral-500'>
      {bcv && (
        <span className='flex items-center gap-1'>
          <strong className='font-semibold'>Dólar BCV:</strong>$
          {bcv.price.toFixed(2)}
          <span className={bcv.symbol === '▲' ? 'text-green-600' : ''}>
            {bcv.symbol}
          </span>
        </span>
      )}
      {bcvEuro && (
        <>
          <span className='-mx-1'>|</span>
          <span className='flex items-center gap-1'>
            <strong className='font-semibold'>Euro BCV:</strong>$
            {bcvEuro.price.toFixed(2)}
            <span className={bcvEuro.symbol === '▲' ? 'text-green-600' : ''}>
              {bcvEuro.symbol}
            </span>
          </span>
        </>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className='flex flex-nowrap items-center justify-start gap-4 overflow-x-auto border-b py-2 pr-8 pl-6 font-sans text-sm whitespace-nowrap sm:justify-center sm:pr-0 sm:pl-0 dark:border-neutral-500'>
      <div className='w-28 flex-shrink-0'>
        <Skeleton className='h-4 w-full rounded' />
      </div>
      <span className='ml-[10px] flex-shrink-0 md:ml-[6px]'>|</span>
      <div className='w-28 flex-shrink-0'>
        <Skeleton className='h-4 w-full rounded' />
      </div>
    </div>
  )
}
