import { Header, Footer } from '..'

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
