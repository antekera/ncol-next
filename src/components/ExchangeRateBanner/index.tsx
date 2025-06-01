'use client'
import useSWR from 'swr'
import { parse } from 'date-fns'
import { Skeleton } from '@components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Response {
  id: string
  source: string
  price: number
  symbol: string
  last_update: string
}

export const ExchangeRateBanner = () => {
  const { data, error, isLoading } = useSWR<Response[]>('/api/dolar/', fetcher)

  if (error)
    return (
      <div className='flex h-[37px] border-b py-2 dark:border-neutral-500' />
    )

  if (isLoading) return <Loading />

  const parsedData = (data ?? []).map(item => ({
    ...item,
    parsedDate: parse(item.last_update, 'dd/MM/yyyy, hh:mm a', new Date())
  }))

  const mostRecentDate = parsedData.reduce(
    (latest, item) => (item.parsedDate > latest ? item.parsedDate : latest),
    new Date(0)
  )

  const validEntries = parsedData.filter(
    item =>
      Math.abs(mostRecentDate.getTime() - item.parsedDate.getTime()) <
      1000 * 60 * 60 * 24 * 3
  )

  const bcv = validEntries.find(item => item.id === 'bcv')
  const bcvEuro = validEntries.find(item => item.id === 'bcv_euro')

  return (
    <div className='flex flex-nowrap justify-start gap-4 overflow-x-auto border-b py-2 pr-8 pl-6 font-sans text-sm whitespace-nowrap sm:justify-center sm:pr-0 sm:pl-0 dark:border-neutral-500'>
      {bcv && (
        <span className='flex items-center gap-1'>
          <strong className='font-semibold'>Dólar BCV:</strong>$
          {bcv.price.toFixed(2)}
          <span className={bcv.symbol === '▲' ? 'text-green-600' : ''}>
            {bcv.symbol}
          </span>
        </span>
      )}
      <span className='-mx-1'>|</span>
      {bcvEuro && (
        <span className='flex items-center gap-1'>
          <strong className='font-semibold'>Euro BCV:</strong>$
          {bcvEuro.price.toFixed(2)}
          <span className={bcvEuro.symbol === '▲' ? 'text-green-600' : ''}>
            {bcvEuro.symbol}
          </span>
        </span>
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
