import { Header } from '@components/Header'
import { Newsletter } from '@components/Newsletter'
import { Content } from '@blocks/content/404Posts'
import { NotFoundAlert } from '@components/NotFoundAlert'

export default async function NotFound() {
  return (
    <>
      <Header />
      <div className='container mx-auto px-6 pb-8'>
        <NotFoundAlert />
        <Content />
        <Newsletter className='my-4 md:hidden' />
      </div>
    </>
  )
}
