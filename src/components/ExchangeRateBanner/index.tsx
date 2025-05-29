'use client'
import useSWR from 'swr'
import { parse } from 'date-fns'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export const ExchangeRateBanner = () => {
  const { data, error } = useSWR('/api/dolar/', fetcher)
  if (error || !data)
    return (
      <div className='flex h-[37px] border-b py-2 dark:border-neutral-500' />
    )

  const parsedData = (data as any[]).map(item => ({
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
  const paralelo = validEntries.find(item => item.id === 'enparalelovzla')
  const bcvEuro = validEntries.find(item => item.id === 'bcv_euro')
  const paraleloEuro = validEntries.find(
    item => item.id === 'enparalelovzla_euro'
  )

  if (!bcv || !paralelo || !bcvEuro || !paraleloEuro)
    return (
      <div className='flex h-[37px] border-b py-2 dark:border-neutral-500' />
    )

  return (
    <div className='flex flex-nowrap justify-start gap-4 overflow-x-auto border-b py-2 pr-8 pl-6 font-sans text-sm whitespace-nowrap sm:justify-center sm:pr-0 sm:pl-0 dark:border-neutral-500'>
      <span className='flex items-center gap-1'>
        <strong className='font-semibold'>Dólar:</strong>$
        {paralelo.price.toFixed(2)}
        <span className={paralelo.symbol === '▲' ? 'text-green-600' : ''}>
          {paralelo.symbol}
        </span>
      </span>
      <span className='flex items-center gap-1'>
        <strong className='font-semibold'>Dólar BCV:</strong>$
        {bcv.price.toFixed(2)}
        <span className={bcv.symbol === '▲' ? 'text-green-600' : ''}>
          {bcv.symbol}
        </span>
      </span>
      <span className='-mx-1'>|</span>
      <span className='flex items-center gap-1'>
        <strong className='font-semibold'>Euro:</strong>$
        {paraleloEuro.price.toFixed(2)}
        <span className={paraleloEuro.symbol === '▲' ? 'text-green-600' : ''}>
          {paraleloEuro.symbol}
        </span>
      </span>
      <span className='flex items-center gap-1'>
        <strong className='font-semibold'>Euro BCV:</strong>$
        {bcvEuro.price.toFixed(2)}
        <span className={bcvEuro.symbol === '▲' ? 'text-green-600' : ''}>
          {bcvEuro.symbol}
        </span>
      </span>
    </div>
  )
}
