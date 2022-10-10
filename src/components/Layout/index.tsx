import { Footer } from '@components/Footer'
import { Header } from '@components/Header'
import { usePageStore } from '@lib/hooks/store'

type LayoutProps = {
  children: React.ReactNode
  headerType?: string
}

const Layout = ({ children, headerType }: LayoutProps) => {
  const { preview } = usePageStore()

  return (
    <>
      <div className='min-h-screen' role='main'>
        {preview && 'This is a preview'}
        <Header headerType={headerType} />
        <main role='main' className='w-full'>
          {children}
        </main>
      </div>
      <Footer />
    </>
  )
}

export { Layout }
export type { LayoutProps }
