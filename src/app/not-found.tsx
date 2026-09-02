import { Header } from '@components/Header'
import { Newsletter } from '@components/Newsletter'
import { Content } from '@blocks/content/404Posts'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { Suspense } from 'react'

export default async function NotFound() {
  return (
    <>
      <Header />
      <div className='container mx-auto px-3 pb-8 sm:px-7'>
        <NotFoundAlert />
        <Suspense>
          <Content />
        </Suspense>
        <Newsletter className='my-4 md:hidden' />
      </div>
    </>
  )
}
