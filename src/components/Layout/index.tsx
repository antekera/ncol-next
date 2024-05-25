import { GoogleTagManager } from '@next/third-parties/google'
import { Martel } from 'next/font/google'

import { Footer } from '@components/Footer'
import { Header } from '@components/Header'
import { TAG_MANAGER_ID } from '@lib/ads'
import { usePageStore } from '@lib/hooks/store'
import { Categories } from '@lib/types'

type LayoutProps = {
  children: React.ReactNode
  headerType?: string
  categories?: Categories
}

const martel = Martel({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

const Layout = ({ children, headerType, categories }: LayoutProps) => {
  const { preview } = usePageStore()

  return (
    <>
      <main className={`min-h-screen ${martel.className}`}>
        {preview && 'This is a preview'}
        <Header headerType={headerType} categories={categories} />
        <main role='main' className='w-full'>
          {children}
        </main>
      </main>
      <Footer />
      <GoogleTagManager gtmId={TAG_MANAGER_ID} />
    </>
  )
}

export { Layout }
