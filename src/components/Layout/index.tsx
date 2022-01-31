import { Container, Header, Footer } from '..'

type LayoutProps = {
  preview?: boolean
  children: React.ReactNode
}

const defaultProps = {
  preview: false,
}

const Layout = ({ preview, children }: LayoutProps) => {
  return (
    <>
      <div className='min-h-screen'>
        {preview && 'This is a preview'}
        <Header />
        <Container className='flex flex-row flex-wrap py-4'>
          <main role='main' className='w-full px-2 pt-1 sm:w-2/3 md:w-3/4'>
            {children}
          </main>
          <aside className='w-full px-2 sm:w-1/3 md:w-1/4'>Sidebar</aside>
        </Container>
      </div>
      <Footer />
    </>
  )
}

Layout.defaultProps = defaultProps

export { Layout }
export type { LayoutProps }
