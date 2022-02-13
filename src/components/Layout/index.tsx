import { Header, Footer } from '..'

type LayoutProps = {
  preview?: boolean
  isLoading?: boolean
  children: React.ReactNode
}

const defaultProps = {
  preview: false,
}

const Layout = ({ preview, isLoading, children }: LayoutProps) => {
  return (
    <>
      <div className='min-h-screen'>
        {preview && 'This is a preview'}
        <Header isLoading={isLoading} />
        <main role='main' className='w-full'>
          {children}
        </main>
      </div>
      <Footer isLoading={isLoading} />
    </>
  )
}

Layout.defaultProps = defaultProps

export { Layout }
export type { LayoutProps }
