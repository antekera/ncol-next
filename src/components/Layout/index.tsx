export interface LayoutProps {
  preview?: boolean
  children: React.ReactNode
}

export const Layout = ({ preview, children }: LayoutProps) => {
  return (
    <>
      <div className='min-h-screen'>
        {preview && 'This is a preview'}
        {/* <Header /> */}
        {children}
      </div>
      {/* <Footer /> */}
    </>
  )
}
