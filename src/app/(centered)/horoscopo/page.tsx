import { Metadata } from 'next'
import Link from 'next/link'
import {
  HOROSCOPO_KEYWORDS,
  ZODIAC_SIGNS,
  getOrderedZodiacSigns
} from '@lib/horoscopo'
import { CMS_NAME, CMS_URL } from '@lib/constants'

export const metadata: Metadata = {
  title: `Horóscopo Semanal - Predicciones del Zodíaco | ${CMS_NAME}`,
  description:
    'Consulta tu horóscopo semanal con predicciones de amor, dinero y bienestar. Predicciones escritas para todos los signos del zodíaco.',
  keywords: [...HOROSCOPO_KEYWORDS, ...ZODIAC_SIGNS.map(sign => sign.signo)],
  openGraph: {
    title: `Horóscopo Semanal | ${CMS_NAME}`,
    description:
      'Consulta tu horóscopo semanal con predicciones de amor, dinero y bienestar.',
    url: `${CMS_URL}/horoscopo`,
    siteName: CMS_NAME,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: `Horóscopo Semanal | ${CMS_NAME}`,
    description:
      'Consulta tu horóscopo semanal con predicciones de amor, dinero y bienestar.'
  },
  alternates: {
    canonical: `${CMS_URL}/horoscopo`
  }
}

export default function HoroscopoPage() {
  const orderedSigns = getOrderedZodiacSigns()

  return (
    <div className='py-4'>
      <header className='mb-10 text-center'>
        <h1 className='mb-4 font-serif text-4xl font-bold text-slate-800 md:text-5xl dark:text-neutral-100'>
          Horóscopo Semanal
        </h1>
        <p className='mx-auto max-w-2xl text-lg text-slate-600 dark:text-neutral-300'>
          Descubre que te deparan los astros esta semana.
        </p>
      </header>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6'>
        {orderedSigns.map(sign => (
          <Link
            key={sign.signo}
            href={`/horoscopo/${sign.signo}`}
            className='group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 no-underline shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800'
          >
            <div
              className='absolute top-0 left-0 h-1 w-full transition-all duration-300 group-hover:h-2'
              style={{ backgroundColor: sign.color }}
            />

            <div
              className='mb-3 text-5xl transition-transform duration-300 group-hover:scale-110 md:text-6xl'
              style={{ color: sign.color }}
            >
              {sign.symbol}
            </div>

            <h2 className='mb-1 text-lg font-bold text-slate-800 no-underline dark:text-neutral-100'>
              {sign.nombre}
            </h2>

            <p className='text-sm text-slate-500 dark:text-neutral-400'>
              {sign.fechas}
            </p>

            <span className='absolute right-4 bottom-4 text-slate-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-neutral-500'>
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
