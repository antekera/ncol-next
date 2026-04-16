import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Manrope, Martel } from 'next/font/google'
import { Footer } from '@components/Footer'
import {
  CMS_NAME,
  CMS_URL,
  HOME_PAGE_TITLE,
  PAGE_DESCRIPTION
} from '@lib/constants'
import { StateContextProvider } from '@lib/context/StateContext'
import { NProgressProvider } from '@providers/progressbar-provider'
import { Toaster } from '@components/ui/sonner'
import { StickyHeaderAd } from '@components/StickyHeaderAd'
import {
  NcolAdSlot,
  NcolAdSlotPopup,
  NcolAdSlotStickyBottom
} from '@components/NcolAdSlot'
import '../styles/index.css'

const appleTouchIcon = 'apple-touch-icon'
const icon = 'icon'

export const metadata: Metadata = {
  metadataBase: new URL(CMS_URL),
  title: {
    template: `%s | ${CMS_NAME}`,
    default: HOME_PAGE_TITLE
  },
  description: PAGE_DESCRIPTION,
  icons: [
    {
      rel: appleTouchIcon,
      sizes: '57x57',
      url: '/favicon/apple-icon-57x57.png'
    },
    {
      rel: appleTouchIcon,
      sizes: '60x60',
      url: '/favicon/apple-icon-60x60.png'
    },
    {
      rel: appleTouchIcon,
      sizes: '72x72',
      url: '/favicon/apple-icon-72x72.png'
    },
    {
      rel: appleTouchIcon,
      sizes: '76x76',
      url: '/favicon/apple-icon-76x76.png'
    },
    {
      rel: appleTouchIcon,
      sizes: '114x114',
      url: '/favicon/apple-icon-114x114.png'
    },
    {
      rel: appleTouchIcon,
      sizes: '120x120',
      url: '/favicon/apple-icon-120x120.png'
    },
    {
      rel: appleTouchIcon,
      sizes: '144x144',
      url: '/favicon/apple-icon-144x144.png'
    },
    {
      rel: appleTouchIcon,
      sizes: '152x152',
      url: '/favicon/apple-icon-152x152.png'
    },
    {
      rel: appleTouchIcon,
      sizes: '180x180',
      url: '/favicon/apple-icon-180x180.png'
    },
    {
      rel: icon,
      type: 'image/png',
      sizes: '192x192',
      url: '/favicon/android-icon-192x192.png'
    },
    {
      rel: icon,
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon/favicon-32x32.png'
    },
    {
      rel: icon,
      type: 'image/png',
      sizes: '96x96',
      url: '/favicon/favicon-96x96.png'
    },
    {
      rel: icon,
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon/favicon-16x16.png'
    },
    {
      rel: 'mask-icon',
      url: '/favicon/safari-pinned-tab.svg',
      color: '#ffffff'
    },
    {
      rel: 'shortcut icon',
      sizes: '192x192',
      url: '/favicon/android-icon-192x192.png'
    }
  ]
}

const outfit = Manrope({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit'
})

const martel = Martel({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif'
})

export default function RootLayout({
  children
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html
      lang='es'
      suppressHydrationWarning
      className={`${outfit.variable} ${martel.variable}`}
    >
      <head>
        <link
          rel='preconnect'
          href='https://www.googletagmanager.com'
          crossOrigin='anonymous'
        />
        <link
          rel='preconnect'
          href='https://www.google.com'
          crossOrigin='anonymous'
        />
        <link
          rel='preconnect'
          href='https://pagead2.googlesyndication.com'
          crossOrigin='anonymous'
        />
        <link
          rel='preconnect'
          href='https://ep1.adtrafficquality.google'
          crossOrigin='anonymous'
        />
        <link
          rel='preconnect'
          href='https://googleads.g.doubleclick.net'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='https://www.googletagmanager.com' />
        <link rel='dns-prefetch' href='https://pagead2.googlesyndication.com' />
        <link rel='dns-prefetch' href='https://googleads.g.doubleclick.net' />
        <link rel='dns-prefetch' href='https://ep1.adtrafficquality.google' />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsMediaOrganization',
              name: CMS_NAME,
              url: CMS_URL,
              logo: {
                '@type': 'ImageObject',
                url: 'https://noticiascol.com/media/logo-plain.png',
                width: 200,
                height: 60
              },
              description: PAGE_DESCRIPTION,
              sameAs: [
                'https://www.facebook.com/noticiasdelacol/',
                'https://x.com/noticiasdelacol',
                'https://www.instagram.com/noticiascol/',
                'https://www.threads.com/@noticiascol',
                'https://whatsapp.com/channel/0029VbALBGh77qVUp56yeN1b'
              ]
            })
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: CMS_NAME,
              url: CMS_URL,
              description: PAGE_DESCRIPTION,
              inLanguage: 'es',
              publisher: {
                '@type': 'NewsMediaOrganization',
                name: CMS_NAME,
                url: CMS_URL
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${CMS_URL}/busqueda/?q={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Secciones principales de Noticiascol',
              itemListElement: [
                {
                  '@type': 'SiteNavigationElement',
                  position: 1,
                  name: 'Sucesos',
                  description: 'Noticias de sucesos en el Zulia y Venezuela',
                  url: `${CMS_URL}/categoria/sucesos/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 2,
                  name: 'Costa Oriental',
                  description:
                    'Noticias de la Costa Oriental del Lago de Maracaibo',
                  url: `${CMS_URL}/categoria/costa-oriental/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 3,
                  name: 'Zulia',
                  description: 'Noticias del estado Zulia',
                  url: `${CMS_URL}/categoria/zulia/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 4,
                  name: 'Ciudad Ojeda',
                  description: 'Noticias de Ciudad Ojeda',
                  url: `${CMS_URL}/categoria/ciudad-ojeda/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 5,
                  name: 'Nacionales',
                  description: 'Noticias nacionales de Venezuela',
                  url: `${CMS_URL}/categoria/nacionales/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 6,
                  name: 'Calculadora Dólar',
                  description:
                    'Precio del dólar hoy en Venezuela - BCV y paralelo',
                  url: `${CMS_URL}/dolar-hoy/`
                }
              ]
            })
          }}
        />
      </head>
      <body className='flex min-h-screen flex-col font-medium'>
        <ThemeProvider attribute='class' disableTransitionOnChange>
          <StateContextProvider>
            <NProgressProvider>
              <StickyHeaderAd>
                <NcolAdSlot
                  slot='header'
                  className='z-40 flex items-center justify-center overflow-hidden border-b border-gray-200 bg-gray-100'
                  priority
                />
              </StickyHeaderAd>
              <main className='flex-1 dark:bg-neutral-900'>{children}</main>
              <Toaster position='bottom-center' richColors />
              <Footer />
              <NcolAdSlotStickyBottom />
              <NcolAdSlotPopup />
            </NProgressProvider>
          </StateContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
