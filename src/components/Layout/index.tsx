import { Header, Footer } from '@components/index'
import { usePageStore } from '@lib/hooks/store'

type LayoutProps = {
  children: React.ReactNode
  headerType: string
  contentHeight?: number
}

const defaultProps = {
  headerType: 'main'
}

const Layout = ({ children, headerType, contentHeight }: LayoutProps) => {
  const preview = usePageStore(state => state.preview)

  return (
    <>
      <div className='min-h-screen' role='main'>
        {preview && 'This is a preview'}
        <Header headerType={headerType} contentHeight={contentHeight} />
        <main role='main' className='w-full'>
          {children}
        </main>
      </div>
      <Footer />
    </>
  )
}

Layout.defaultProps = defaultProps

export { Layout }
export type { LayoutProps }
