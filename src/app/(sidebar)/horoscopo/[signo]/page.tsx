'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Container } from '@components/Container'
import { Sidebar } from '@components/Sidebar'
import { Skeleton } from '@components/ui/skeleton'
import { HoroscopoShareImage } from '@components/HoroscopoShareImage'
import { useHoroscopo } from '@lib/hooks/data/useHoroscopo'
import { ZODIAC_SIGNS, getZodiacSign } from '@lib/horoscopo'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { Content } from '@blocks/content/404Posts'
import { Suspense } from 'react'

const CATEGORY_ICONS = {
  amor: '❤️',
  riqueza: '💰',
  bienestar: '🧘'
}

export default function HoroscopoSignoPage() {
  const params = useParams()
  const signo = params?.signo as string

  const { horoscopo, isLoading, error } = useHoroscopo(signo)
  const zodiacInfo = getZodiacSign(signo)

  const currentIndex = ZODIAC_SIGNS.findIndex(s => s.signo === signo)
  const prevSign = ZODIAC_SIGNS[currentIndex - 1] || ZODIAC_SIGNS[11]
  const nextSign = ZODIAC_SIGNS[currentIndex + 1] || ZODIAC_SIGNS[0]

  if (!zodiacInfo) {
    return (
      <Container className='py-10'>
        <NotFoundAlert />
        <Suspense>
          <Content />
        </Suspense>
      </Container>
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      // Add time to avoid timezone shift (e.g. 2026-02-22T12:00:00)
      const date = new Date(`${dateStr}T12:00:00`)
      return format(date, "d 'de' MMMM", { locale: es })
    } catch {
      return dateStr
    }
  }

  const HeaderSection = (
    <div
      className='border-b border-slate-200 dark:border-neutral-500'
      style={{
        background: `linear-gradient(135deg, ${zodiacInfo.color}15, transparent)`
      }}
    >
      <Container className='text-left'>
        <div className='flex items-center gap-4 py-4 md:py-6'>
          <span
            className='text-5xl md:text-6xl'
            style={{ color: zodiacInfo.color }}
          >
            {zodiacInfo.symbol}
          </span>
          <div>
            <h1 className='font-serif text-3xl font-bold text-slate-800 md:text-4xl dark:text-neutral-100'>
              {zodiacInfo.nombre}
            </h1>
            <p className='text-slate-600 dark:text-neutral-400'>
              {zodiacInfo.fechas}
            </p>
          </div>
        </div>
      </Container>
    </div>
  )

  if (isLoading) {
    return (
      <>
        {HeaderSection}
        <Container className='py-10' sidebar>
          <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
            <div className='space-y-6'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-32 w-full' />
              <Skeleton className='h-32 w-full' />
              <Skeleton className='h-32 w-full' />
            </div>
          </section>
          <Sidebar />
        </Container>
      </>
    )
  }

  if (error || !horoscopo) {
    return (
      <>
        {HeaderSection}
        <Container className='py-10' sidebar>
          <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
            <div className='rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-700 dark:bg-amber-900/20'>
              <p className='text-amber-800 dark:text-amber-200'>
                No hay horóscopo disponible para esta semana. ¡Vuelve pronto!
              </p>
            </div>
          </section>
          <Sidebar />
        </Container>
      </>
    )
  }

  return (
    <>
      {HeaderSection}
      <Container className='py-10' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <div className='space-y-8'>
            <div className='font-sans text-sm text-slate-500 dark:text-neutral-400'>
              Del{' '}
              <span className='font-medium'>
                {formatDate(horoscopo.semana_inicio)}
              </span>{' '}
              al{' '}
              <span className='font-medium'>
                {formatDate(horoscopo.semana_fin)}
              </span>
            </div>

            <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800'>
              <p className='font-sans text-lg leading-relaxed text-slate-700 dark:text-neutral-200'>
                {horoscopo.introduccion}
              </p>
            </div>

            <div className='space-y-4'>
              <article className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800'>
                <h2 className='mb-3 flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-neutral-100'>
                  <span className='text-2xl'>{CATEGORY_ICONS.amor}</span>
                  Amor
                </h2>
                <p className='font-sans leading-relaxed text-slate-600 dark:text-neutral-300'>
                  {horoscopo.amor}
                </p>
              </article>

              <article className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800'>
                <h2 className='mb-3 flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-neutral-100'>
                  <span className='text-2xl'>{CATEGORY_ICONS.riqueza}</span>
                  Riqueza
                </h2>
                <p className='font-sans leading-relaxed text-slate-600 dark:text-neutral-300'>
                  {horoscopo.riqueza}
                </p>
              </article>

              <article className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800'>
                <h2 className='mb-3 flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-neutral-100'>
                  <span className='text-2xl'>{CATEGORY_ICONS.bienestar}</span>
                  Bienestar
                </h2>
                <p className='font-sans leading-relaxed text-slate-600 dark:text-neutral-300'>
                  {horoscopo.bienestar}
                </p>
              </article>
            </div>

            <HoroscopoShareImage horoscopo={horoscopo} />

            <nav className='flex items-center justify-between border-t border-slate-200 pt-6 font-sans dark:border-neutral-700'>
              <Link
                href={`/horoscopo/${prevSign.signo}`}
                className='flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              >
                <span>←</span>
                <span style={{ color: prevSign.color }}>{prevSign.symbol}</span>
                <span className='hidden sm:inline'>{prevSign.nombre}</span>
              </Link>

              <Link
                href='/horoscopo'
                className='text-primary text-sm no-underline hover:underline'
              >
                Todos los signos
              </Link>

              <Link
                href={`/horoscopo/${nextSign.signo}`}
                className='flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              >
                <span className='hidden sm:inline'>{nextSign.nombre}</span>
                <span style={{ color: nextSign.color }}>{nextSign.symbol}</span>
                <span>→</span>
              </Link>
            </nav>
          </div>
        </section>
        <Sidebar />
      </Container>
    </>
  )
}
