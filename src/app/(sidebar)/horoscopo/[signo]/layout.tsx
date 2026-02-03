import { Metadata } from 'next'
import { ZODIAC_SIGNS, getZodiacSign, HOROSCOPO_KEYWORDS } from '@lib/horoscopo'
import { CMS_NAME, CMS_URL } from '@lib/constants'

interface Props {
  params: Promise<{ signo: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { signo } = await params
  const zodiacInfo = getZodiacSign(signo)

  if (!zodiacInfo) {
    return {
      title: `Signo no encontrado | ${CMS_NAME}`
    }
  }

  const title = `Horóscopo de ${zodiacInfo.nombre} - Predicción Semanal | ${CMS_NAME}`
  const description = `Descubre el horóscopo semanal de ${zodiacInfo.nombre} (${zodiacInfo.fechas}). Predicciones de amor, dinero y bienestar con el sabor maracucho.`

  return {
    title,
    description,
    keywords: [zodiacInfo.nombre.toLowerCase(), signo, ...HOROSCOPO_KEYWORDS],
    openGraph: {
      title: `Horóscopo de ${zodiacInfo.nombre} | ${CMS_NAME}`,
      description,
      url: `${CMS_URL}/horoscopo/${signo}`,
      siteName: CMS_NAME,
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${zodiacInfo.symbol} Horóscopo de ${zodiacInfo.nombre}`,
      description
    },
    alternates: {
      canonical: `${CMS_URL}/horoscopo/${signo}`
    }
  }
}

export async function generateStaticParams() {
  return ZODIAC_SIGNS.map(sign => ({
    signo: sign.signo
  }))
}

export default function HoroscopoSignoLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
