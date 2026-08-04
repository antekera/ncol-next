export const revalidate = 86400

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Container } from '@components/Container'
import { Sidebar } from '@components/Sidebar'
import { Loading } from '@components/LoadingCategory'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { CMS_URL } from '@lib/constants'
import { getAuthorProfile } from '@app/actions/getAuthorData'
import { AuthorPostsContent } from '@blocks/content/AuthorPosts'

type Params = { slug: string }

export async function generateMetadata({
  params
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const author = await getAuthorProfile(slug)
  if (!author) return sharedOpenGraph

  return {
    ...sharedOpenGraph,
    title: author.name,
    description: author.description || sharedOpenGraph.description,
    alternates: { canonical: `${CMS_URL}/autor/${slug}/` },
    openGraph: {
      ...sharedOpenGraph.openGraph,
      title: author.name,
      url: `${CMS_URL}/autor/${slug}/`
    }
  }
}

export default async function Page(props: { params: Promise<Params> }) {
  const { slug } = await props.params
  const author = await getAuthorProfile(slug)

  if (!author) return notFound()

  return (
    <>
      <Container className='py-6' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <div className='mb-8 flex items-start gap-5 rounded-xl border border-slate-200 p-5 dark:border-neutral-700'>
            {author.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt={author.name}
                width={88}
                height={88}
                className='size-22 shrink-0 rounded-full object-cover grayscale'
                priority
              />
            ) : (
              <span className='flex size-[88px] shrink-0 items-center justify-center rounded-full bg-slate-200 text-3xl font-bold text-slate-500 dark:bg-neutral-700 dark:text-neutral-300'>
                {author.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className='min-w-0'>
              <h1 className='text-xl font-bold text-slate-800 dark:text-slate-100'>
                {author.name}
              </h1>
              {author.profession && (
                <div
                  className='mt-0.5 text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-neutral-500 [&_p]:mb-0'
                  dangerouslySetInnerHTML={{ __html: author.profession }}
                />
              )}
              {author.description && (
                <div
                  className='mt-2 text-sm leading-relaxed text-slate-500 dark:text-neutral-400 [&_p]:mb-0'
                  dangerouslySetInnerHTML={{ __html: author.description }}
                />
              )}
              {author.biography && (
                <div
                  className='mt-3 text-sm leading-relaxed text-slate-600 dark:text-neutral-300 [&_p]:mb-0'
                  dangerouslySetInnerHTML={{ __html: author.biography }}
                />
              )}
            </div>
          </div>

          <NcolAdSlot slot='article-top' className='my-4 flex justify-center' />

          <Suspense fallback={<Loading />}>
            <AuthorPostsContent slug={slug} />
          </Suspense>
        </section>
        <Sidebar hideMostVisited />
      </Container>
    </>
  )
}
