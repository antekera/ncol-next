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

const CURRENCY_USD_BCV = 'USD_BCV'
const CURRENCY_USD_PARALELO = 'USD_PARALELO'
const CURRENCY_VES = 'VES'

export const DollarCalculator = ({ className }: { className?: string }) => {
  const [amount, setAmount] = useState<string>('1')
  const [currency, setCurrency] = useState<
    typeof CURRENCY_USD_BCV | typeof CURRENCY_USD_PARALELO | typeof CURRENCY_VES
  >(CURRENCY_USD_BCV)

  const { data, isLoading } = useSessionSWR<Response[]>(
    '/api/dolar/',
    'dolar_nonce'
  )

  const rates = useMemo(() => {
    if (!data) return { oficial: null, paralelo: null }

    // Function to get the latest record by last_update for a specific ID
    const getLatest = (id: string) => {
      const filtered = data.filter(item => item.id === id)
      if (filtered.length === 0) return null
      return filtered.reduce(
        (prev, current) =>
          new Date(current.last_update).getTime() >
          new Date(prev.last_update).getTime()
            ? current
            : prev,
        filtered[0]
      )
    }

    return {
      oficial: getLatest('oficial'),
      paralelo: getLatest('paralelo')
    }
  }, [data])

  const currentRate = useMemo(() => {
    if (currency === CURRENCY_USD_BCV) return rates.oficial?.price || 0
    if (currency === CURRENCY_USD_PARALELO) return rates.paralelo?.price || 0
    // If output is VES, we use paralelo for the conversion result comparison
    return rates.paralelo?.price || 0
  }, [currency, rates])

  const convertedValue = useMemo(() => {
    // Handle both dot and comma as decimal separator
    const normalizedAmount = amount.replace(',', '.')
    const val = parseFloat(normalizedAmount)

    if (isNaN(val) || !currentRate) return '---'

    const isUsd =
      currency === CURRENCY_USD_BCV || currency === CURRENCY_USD_PARALELO
    const result = isUsd ? val * currentRate : val / currentRate

    return result.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }, [amount, currency, currentRate])

  if (isLoading) return <Skeleton className='mb-8 h-40 w-full' />
  if (!rates.oficial && !rates.paralelo) return null

  return (
    <div
      className={cn(
        'dark:bg-card border-primary/20 dark:border-primary/20 mb-8 rounded-xl border bg-white p-6 font-sans shadow-md',
        className
      )}
    >
      <h3 className='text-foreground mb-4 text-xl font-bold'>
        Calculadora de Divisas
      </h3>

      <div className='flex flex-col gap-6 lg:flex-row'>
        {/* Lado izquierdo: Tasas */}
        <div className='flex flex-col gap-3 lg:w-64'>
          <div className='flex w-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50'>
            {/* Tasa BCV */}
            {rates.oficial && (
              <div className='mb-4 last:mb-0'>
                <p className='mb-2 text-sm font-semibold tracking-wider text-neutral-600 uppercase dark:text-neutral-400'>
                  Tasa del Día
                </p>
                <div className='flex items-baseline gap-1'>
                  <span className='text-5xl font-black tracking-tight text-slate-700 dark:text-neutral-200'>
                    {rates.oficial.price.toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                  <span className='font-bold text-slate-500 dark:text-neutral-500'>
                    VES
                  </span>
                </div>
              </div>
            )}

            {/* Single Updated Line */}
            {(rates.oficial?.last_update || rates.paralelo?.last_update) && (
              <span className='mt-2 border-t border-slate-200 pt-2 text-xs font-medium text-slate-500 dark:border-neutral-700 dark:text-neutral-500'>
                Actualizado:{' '}
                {format(
                  new Date(
                    Math.max(
                      new Date(rates.oficial?.last_update || 0).getTime(),
                      new Date(rates.paralelo?.last_update || 0).getTime()
                    )
                  ),
                  "d 'de' MMM, h:mm a",
                  { locale: es }
                )}
              </span>
            )}
          </div>
        </div>

        {/* Lado derecho: Formulario */}
        <div className='flex min-w-0 flex-1 flex-col justify-between py-1'>
          <div className='mb-2 flex w-full flex-col gap-4 lg:flex-row'>
            {/* Cantidad */}
            <div className='w-full min-w-0 lg:flex-1'>
              <label
                htmlFor='amount-input'
                className='mb-1.5 block text-sm font-bold text-slate-500 uppercase dark:text-neutral-500'
              >
                CANTIDAD
              </label>
              <div className='relative w-full'>
                <span className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-bold text-slate-500 dark:text-neutral-500'>
                  {currency === CURRENCY_VES ? 'Bs' : '$'}
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
                    'border-input bg-background focus:ring-primary/20 focus:border-primary w-full appearance-none rounded-lg border py-2 pr-4 font-sans text-xl font-bold transition-all focus:ring-2 focus:outline-none',
                    'pl-10'
                  )}
                />
              </div>
            </div>

            {/* Moneda */}
            <div className='w-full flex-shrink-0 lg:w-48'>
              <label
                htmlFor='currency-select'
                className='mb-1.5 block text-sm font-bold text-slate-500 uppercase dark:text-neutral-500'
              >
                MONEDA
              </label>
              <div className='relative w-full'>
                <select
                  id='currency-select'
                  value={currency}
                  onChange={e => setCurrency(e.target.value as any)}
                  className='border-input bg-background focus:ring-primary/20 focus:border-primary w-full cursor-pointer appearance-none rounded-lg border px-4 py-3 pr-10 font-sans text-sm font-bold transition-all focus:ring-2 focus:outline-none'
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231b75bb%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '0.65em auto'
                  }}
                >
                  <option value={CURRENCY_USD_BCV}>USD BCV ($)</option>
                  <option value={CURRENCY_USD_PARALELO}>USD ($)</option>
                  <option value={CURRENCY_VES}>VES (Bs)</option>
                </select>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col dark:border-neutral-800'>
            <span className='mb-1 block text-sm font-bold text-slate-500 uppercase dark:text-neutral-500'>
              Resultado
            </span>
            <div className='flex flex-wrap items-baseline gap-2'>
              <span className='text-foreground text-3xl font-black tracking-tight'>
                {convertedValue.split(',')[0]}
                {convertedValue.includes(',') && (
                  <span className='text-2xl font-bold opacity-80'>
                    ,{convertedValue.split(',')[1]}
                  </span>
                )}
              </span>
              {convertedValue !== '---' && (
                <span className='text-2xl font-black text-slate-500 dark:text-neutral-500'>
                  {currency === CURRENCY_VES ? '$' : 'VES'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
