import { Header, Footer } from '@components/index'
import { usePageStore } from '@lib/hooks/store'

type LayoutProps = {
  children: React.ReactNode
  headerType?: string
}

const Layout = ({ children, headerType }: LayoutProps) => {
  const preview = usePageStore(state => state.preview)

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
