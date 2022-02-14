import { usePageState } from 'lib/stores/pageStore'

import { Header, Footer } from '..'

type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const pageState = usePageState()

  return (
    <>
      <div className='min-h-screen'>
        {pageState.preview.get() && 'This is a preview'}
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
