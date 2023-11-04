import { Footer } from '@components/Footer'
import { Header } from '@components/Header'
import { usePageStore } from '@lib/hooks/store'
import { Categories } from '@lib/types'

type LayoutProps = {
  children: React.ReactNode
  headerType?: string
  categories?: Categories
}

const Layout = ({ children, headerType, categories }: LayoutProps) => {
  const { preview } = usePageStore()

  return (
    <>
      <div className='min-h-screen' role='main'>
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
