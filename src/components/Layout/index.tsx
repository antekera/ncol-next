import { usePageStore } from 'lib/hooks/store'

import { Header, Footer } from '..'

type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const preview = usePageStore(state => state.preview)

  return (
    <>
      <div className='min-h-screen'>
        {preview && 'This is a preview'}
        <Header />
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
