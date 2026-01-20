'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { IMaskInput } from 'react-imask'

import { useState, useMemo } from 'react'
import { useSessionSWR } from '@lib/hooks/useSessionSWR'
import { Skeleton } from '@components/ui/skeleton'
import { cn } from '@lib/shared'

interface Response {
  id: string
  source: string
  price: number
  last_update: string
  fetched_at: string
}

const CURRENCY_USD = 'USD'
const CURRENCY_VES = 'VES'

export const DollarCalculator = ({ className }: { className?: string }) => {
  const [amount, setAmount] = useState<string>('1')
  const [currency, setCurrency] = useState<
    typeof CURRENCY_USD | typeof CURRENCY_VES
  >(CURRENCY_USD)

  const { data, isLoading } = useSessionSWR<Response[]>(
    '/api/dolar/',
    'dolar_nonce'
  )

  const rateData = useMemo(() => {
    const officialRates = (data ?? []).filter(item => item.id === 'oficial')
    return (
      [...officialRates].sort(
        (a, b) =>
          new Date(b.last_update).getTime() - new Date(a.last_update).getTime()
      )[0] || null
    )
  }, [data])

  const rate = rateData?.price || 0

  const convertedValue = useMemo(() => {
    const val = parseFloat(amount)
    if (isNaN(val) || !rate) return '---'

    const result = currency === CURRENCY_USD ? val * rate : val / rate

    return result.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }, [amount, currency, rate])

  if (isLoading) return <Skeleton className='mb-8 h-40 w-full' />
  if (!rateData) return null

  return (
    <div
      className={cn(
        'dark:bg-card border-primary/20 dark:border-primary/20 mb-8 rounded-xl border bg-white p-6 font-sans shadow-md',
        className
      )}
    >
      <h3 className='text-foreground mb-3 text-xl font-bold'>
        Calculadora de Divisas (BCV)
      </h3>

      <div className='flex flex-col gap-8 lg:flex-row'>
        <div className='bg-primary/5 dark:bg-primary/10 border-primary/10 flex w-full flex-col items-center justify-center rounded-xl border p-6 lg:w-auto lg:min-w-[240px] lg:items-start'>
          <span className='mb-2 text-sm font-semibold tracking-wider text-neutral-600 uppercase dark:text-neutral-400'>
            Tasa Oficial BCV
          </span>
          <div className='flex items-baseline gap-1'>
            <span className='text-5xl font-bold tracking-tight text-neutral-600 dark:text-neutral-400'>
              {rate.toLocaleString('es-VE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
            <span className='text-lg font-medium text-neutral-600 dark:text-neutral-400'>
              VES
            </span>
          </div>
          {rateData.last_update && (
            <span className='mt-3 text-center text-xs text-slate-500 lg:text-left dark:text-neutral-300'>
              Actualizado:{' '}
              {format(new Date(rateData.last_update), "d 'de' MMMM, h:mm a", {
                locale: es
              })}
            </span>
          )}
        </div>

        <div className='flex flex-1 flex-col justify-center gap-6'>
          <div className='flex w-full flex-col gap-4 lg:flex-row'>
            <div className='w-full flex-1'>
              <label
                htmlFor='amount-input'
                className='mb-1.5 block text-sm font-medium text-slate-500 dark:text-neutral-300'
              >
                Cantidad
              </label>
              <div className='relative'>
                <span className='absolute top-1/2 left-3 -translate-y-1/2 font-medium text-slate-500 dark:text-neutral-300'>
                  {currency === CURRENCY_USD ? '$' : 'VES'}
                </span>
                <IMaskInput
                  id='amount-input'
                  mask={Number}
                  scale={2}
                  thousandsSeparator='.'
                  padFractionalZeros={false}
                  normalizeZeros={true}
                  radix=','
                  mapToRadix={['.']}
                  value={amount}
                  unmask={true}
                  onAccept={(value: string) => setAmount(value)}
                  className={cn(
                    'border-input bg-background focus:ring-primary/20 focus:border-primary w-full rounded-lg border py-3 pr-4 font-sans text-lg font-medium transition-all focus:ring-2 focus:outline-none',
                    currency === CURRENCY_USD ? 'pl-6' : 'pl-12'
                  )}
                />
              </div>
            </div>

            <div className='w-full lg:w-40'>
              <label
                htmlFor='currency-select'
                className='mb-1.5 block text-sm font-medium text-slate-500 dark:text-neutral-300'
              >
                Moneda
              </label>
              <select
                id='currency-select'
                value={currency}
                onChange={e =>
                  setCurrency(
                    e.target.value as typeof CURRENCY_USD | typeof CURRENCY_VES
                  )
                }
                className='border-input bg-background focus:ring-primary/20 focus:border-primary w-full cursor-pointer appearance-none rounded-lg border px-4 py-3 font-sans text-lg font-medium transition-all focus:ring-2 focus:outline-none'
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231b75bb%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '0.65em auto'
                }}
              >
                <option value={CURRENCY_USD}>USD ($)</option>
                <option value={CURRENCY_VES}>VES (Bs)</option>
              </select>
            </div>
          </div>

          <div className='flex flex-col'>
            <span className='mb-1 block text-sm font-medium text-slate-500 dark:text-neutral-300'>
              Convertido a
            </span>
            <div className='flex items-baseline gap-2'>
              <span className='text-foreground text-3xl font-bold tracking-tight lg:text-4xl'>
                {convertedValue.split(',')[0]}
                {convertedValue.includes(',') && (
                  <span className='text-1xl text-foreground font-semibold lg:text-2xl'>
                    ,{convertedValue.split(',')[1]}
                  </span>
                )}
              </span>
              {convertedValue !== '---' && (
                <span className='text-xl font-medium text-slate-500 lg:text-2xl dark:text-neutral-400'>
                  {currency === CURRENCY_USD ? 'VES' : '$'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
