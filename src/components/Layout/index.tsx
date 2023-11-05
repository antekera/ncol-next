import { Martel } from 'next/font/google'

import { Footer } from '@components/Footer'
import { Header } from '@components/Header'
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
      <div className={`min-h-screen ${martel.className}`} role='main'>
        {preview && 'This is a preview'}
        <Header headerType={headerType} categories={categories} />
        <main role='main' className='w-full'>
          {children}
        </main>
      </div>
      <Footer />
    </>
  )
}

export { Layout }
