import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Manrope, Martel } from 'next/font/google'
import { Footer } from '@components/Footer'
import { DeferredRender } from '@components/DeferredRender'
import { ADS_ENABLED, RESERVE_HEADER_HEIGHT } from '@lib/config'
import {
  CMS_NAME,
  CMS_URL,
  COMPANY_NAME,
  HOME_PAGE_TITLE,
  PAGE_DESCRIPTION
} from '@lib/constants'
import { TEXT_SIZE_DEFAULT, TEXT_SIZE_STORAGE_KEY } from '@lib/textSize'
import { StateContextProvider } from '@lib/context/StateContext'
import { LoginModalProvider } from '@components/auth/LoginModalContext'
import { OneSignalInit } from '@components/OneSignalInit'
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
  // Sin estas directivas se aplican los límites de snippet por defecto, que
  // recortan el fragmento citable en buscadores y respuestas generativas.
  // Las rutas que declaran `robots: { index: false }` siguen ganando por
  // especificidad, así que las páginas de soporte no se ven afectadas.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: `${CMS_URL}/feed.xml`, title: `${CMS_NAME} — Últimas noticias` }
      ]
    }
  },
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
          href='https://cdn.noticiascol.com'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='https://cdn.noticiascol.com' />
        <link rel='dns-prefetch' href='https://www.google.com' />
        <link rel='dns-prefetch' href='https://www.googletagmanager.com' />
        <link rel='dns-prefetch' href='https://pagead2.googlesyndication.com' />
        <link rel='dns-prefetch' href='https://googleads.g.doubleclick.net' />
        <link rel='dns-prefetch' href='https://ep1.adtrafficquality.google' />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var value = localStorage.getItem('${TEXT_SIZE_STORAGE_KEY}') || '${TEXT_SIZE_DEFAULT}';
                  document.documentElement.dataset.fontSize = value;
                } catch (e) {}
              })();
            `
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsMediaOrganization',
              '@id': `${CMS_URL}/#organization`,
              name: CMS_NAME,
              alternateName: 'NCOL',
              url: CMS_URL,
              logo: {
                '@type': 'ImageObject',
                url: `${CMS_URL}/media/logo-plain.png`,
                width: 200,
                height: 60
              },
              description: PAGE_DESCRIPTION,
              foundingDate: '2012',
              knowsLanguage: 'es',
              areaServed: [
                { '@type': 'Country', name: 'Venezuela' },
                { '@type': 'AdministrativeArea', name: 'Zulia' }
              ],
              parentOrganization: {
                '@type': 'Organization',
                name: COMPANY_NAME
              },
              publishingPrinciples: `${CMS_URL}/quienes-somos/`,
              ethicsPolicy: `${CMS_URL}/quienes-somos/`,
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'editorial',
                url: `${CMS_URL}/contacto/`
              },
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
              '@id': `${CMS_URL}/#website`,
              name: CMS_NAME,
              url: CMS_URL,
              description: PAGE_DESCRIPTION,
              inLanguage: 'es',
              publisher: { '@id': `${CMS_URL}/#organization` },
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
                  description:
                    'Noticias de sucesos en Venezuela con seguimiento de última hora',
                  url: `${CMS_URL}/categoria/sucesos/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 2,
                  name: 'Nacionales',
                  description: 'Noticias nacionales de Venezuela',
                  url: `${CMS_URL}/categoria/nacionales/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 3,
                  name: 'Internacionales',
                  description:
                    'Noticias internacionales con impacto en Venezuela',
                  url: `${CMS_URL}/categoria/internacionales/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 4,
                  name: 'Deportes',
                  description:
                    'Cobertura deportiva de Venezuela, fútbol, béisbol y más',
                  url: `${CMS_URL}/categoria/deportes/`
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 5,
                  name: 'Zulia',
                  description:
                    'Cobertura regional propia desde Zulia para entender la agenda del país',
                  url: `${CMS_URL}/categoria/zulia/`
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
        {ADS_ENABLED && RESERVE_HEADER_HEIGHT && (
          <noscript>
            <style>{`#header-ad-shell{display:none}`}</style>
          </noscript>
        )}
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <StateContextProvider>
            <NProgressProvider>
              <LoginModalProvider>
                <OneSignalInit />
                {ADS_ENABLED && (
                  <div
                    id='header-ad-shell'
                    className={
                      RESERVE_HEADER_HEIGHT ? 'min-h-[250px]' : undefined
                    }
                  >
                    <DeferredRender timeoutMs={1500}>
                      <StickyHeaderAd>
                        <NcolAdSlot
                          slot='header'
                          className='z-40 flex items-center justify-center overflow-hidden border-b border-gray-200 bg-gray-100'
                        />
                      </StickyHeaderAd>
                    </DeferredRender>
                  </div>
                )}
                <main className='flex-1 dark:bg-neutral-900'>{children}</main>
                <Toaster position='bottom-center' richColors />
                <Footer />
                <DeferredRender timeoutMs={2500}>
                  <NcolAdSlotStickyBottom />
                  <NcolAdSlotPopup />
                </DeferredRender>
              </LoginModalProvider>
            </NProgressProvider>
          </StateContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
