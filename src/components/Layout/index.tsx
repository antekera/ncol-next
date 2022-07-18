import { useEffect } from 'react'

import { useRouter } from 'next/router'

import { Header, Footer } from '@components/index'
import { usePageStore } from '@lib/hooks/store'

type LayoutProps = {
  children: React.ReactNode
  headerType?: string
}

const Layout = ({ children, headerType }: LayoutProps) => {
  const { preview, setPageSetupState } = usePageStore()

  const router = useRouter()
  const isLoading = router.isFallback

  useEffect(() => {
    setPageSetupState({
      isLoading
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

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
