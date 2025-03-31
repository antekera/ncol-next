import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Martel } from 'next/font/google'
import { Footer } from '@components/Footer'
import { CMS_NAME, HOME_PAGE_TITLE, PAGE_DESCRIPTION } from '@lib/constants'
import { StateContextProvider } from '@lib/context/StateContext'
import { NProgressProvider } from '@providers/progressbar-provider'
import '../styles/index.css'

const appleTouchIcon = 'apple-touch-icon'
const icon = 'icon'

export const metadata: Metadata = {
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

const martel = Martel({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

export default function RootLayout({
  children
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body>
        <ThemeProvider attribute='class' disableTransitionOnChange>
          <StateContextProvider>
            <NProgressProvider>
              <main
                className={`min-h-screen ${martel.className} dark:bg-neutral-900`}
              >
                {children}
              </main>
              <Footer />
            </NProgressProvider>
          </StateContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
