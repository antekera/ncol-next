import { usePageStore } from 'lib/hooks/store'

import { Header, Footer } from '..'
import { HeaderType } from '../Header'

type LayoutProps = {
  children: React.ReactNode
  headerType: string
}

const defaultProps = {
  headerType: HeaderType.Main,
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

Layout.defaultProps = defaultProps

export { Layout }
export type { LayoutProps }
