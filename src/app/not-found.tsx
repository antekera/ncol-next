import { ChevronRight, TriangleAlert } from 'lucide-react'
import { getRightPostsForHome } from '@app/actions/getAllPostsForHome'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CategoryArticle } from '@components/CategoryArticle'
import { Header } from '@components/Header'
import { Newsletter } from '@components/Newsletter'
import { CATEGORIES, CMS_URL } from '@lib/constants'

const notFoundTitle = 'Página no encontrada'

export const metadata: Metadata = {
  title: notFoundTitle
}

export default async function NotFound() {
  const data = await getRightPostsForHome(CATEGORIES.COL_LEFT, 20)
  const posts = data ? data?.edges : []
  const hasPosts = posts && posts.length > 0

  return (
    <>
      <Header />
      <div className='container mx-auto px-6 pb-8'>
        <div className='mt-6 mb-6 flex w-full justify-center rounded-md bg-gray-50 py-8'>
          <div className='flex flex-col text-center'>
            <TriangleAlert color={'red'} className='mx-auto' size={32} />
            <h1 className='mt-2 text-2xl text-slate-900 uppercase'>
              {notFoundTitle}
            </h1>
            <p className='mb-3 px-4 font-sans text-sm text-gray-500 md:mb-4 md:text-base'>
              La página solicitada no existe o fue borrada.
            </p>
            {CMS_URL && (
              <Link
                href={CMS_URL}
                className='text-primary hover:text-secondary mx-auto flex inline-block items-center font-sans md:text-lg'
              >
                <span>Ir al inicio</span>
                <ChevronRight size={20} />
              </Link>
            )}
          </div>
        </div>
        {hasPosts && (
          <p className='mb-6 border-b border-slate-200 py-4 font-sans text-2xl font-medium text-slate-900 md:text-3xl'>
            Noticias recientes:
          </p>
        )}
        {hasPosts &&
          posts.map(({ node }, index) => (
            <CategoryArticle
              key={node.id}
              {...node}
              isFirst={index === 0}
              isLast={index + 1 === posts.length}
            />
          ))}
        <Newsletter className='my-4 md:hidden' />
      </div>
    </>
  )
}
