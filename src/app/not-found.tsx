import { Header } from '@components/Header'
import { Newsletter } from '@components/Newsletter'
import { Content } from '@blocks/content/404Posts'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { Suspense } from 'react'
import './not-found-page.css'

export default async function NotFound() {
  return (
    <>
      <Header />
      <div className='not-found-page-container'>
        <NotFoundAlert />
        <Suspense>
          <Content />
        </Suspense>
        <Newsletter className='not-found-page-newsletter' />
      </div>
    </>
  )
}