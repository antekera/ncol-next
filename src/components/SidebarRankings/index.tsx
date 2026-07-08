'use client'

import * as Sentry from '@sentry/nextjs'
import { ArrowRight } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { CategoryArticle } from '@components/CategoryArticle'
import { MostVisitedPostsSkeleton } from '@components/MostVisitedPosts/MostVisitedPostsSkeleton'
import { useSidebarRankings } from '@lib/hooks/data/useSidebarRankings'
import {
  getPostClasses,
  getPostRankClasses,
  getPostsContainerClasses,
  getSeparatorClasses,
  getTitleClasses
} from '@components/MostVisitedPosts/styles'

const postsContainerClasses = getPostsContainerClasses(true)
const postClasses = getPostClasses(true)
const postRankClasses = getPostRankClasses(true)
const titleClasses = getTitleClasses()
const separatorClasses = getSeparatorClasses()

const RankingSection = ({
  title,
  href,
  posts,
  showSkeleton
}: {
  title: string
  href: string
  posts: { slug: string; title: string; image: string }[]
  showSkeleton?: boolean
}) => (
  <section aria-label={title} className='mb-6'>
    <div className='mb-4'>
      <h5 className={titleClasses}>{title}</h5>
      <hr className={separatorClasses} />
    </div>

    {showSkeleton ? (
      <div className={postsContainerClasses}>
        <MostVisitedPostsSkeleton isRow className={postClasses} />
      </div>
    ) : (
      <div className={postsContainerClasses}>
        {posts
          .filter(post => post?.image && post?.slug)
          .map(({ slug, image, title: postTitle }, index) => (
            <div key={slug} className={postClasses}>
              <div className={postRankClasses}>
                <span>{index + 1}</span>
              </div>
              <div className='z-10'>
                <CategoryArticle
                  id={slug}
                  title={postTitle}
                  uri={slug}
                  featuredImage={{ node: { sourceUrl: image } }}
                  type='most_visited'
                  imageSize='xs'
                />
              </div>
            </div>
          ))}
      </div>
    )}

    <HoverPrefetchLink
      href={href}
      className='group mt-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition-all hover:border-sky-300 hover:bg-sky-100 hover:text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400 dark:hover:border-sky-700 dark:hover:bg-sky-900/40 dark:hover:text-sky-300'
    >
      Ver más
      <ArrowRight
        size={13}
        className='transition-transform duration-200 group-hover:translate-x-0.5'
      />
    </HoverPrefetchLink>
  </section>
)

export const SidebarRankings = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '200px 0px',
    fallbackInView: true
  })
  const { data, error } = useSidebarRankings({ load: inView })

  if (error) {
    Sentry.captureException(error, {
      tags: { component: 'SidebarRankings' }
    })
    return null
  }

  const showSkeleton = !data

  return (
    <div ref={ref}>
      <RankingSection
        title='Más leídos'
        href='/mas-leidos'
        posts={data?.mostRead ?? []}
        showSkeleton={showSkeleton}
      />
      <RankingSection
        title='Más visto hoy'
        href='/mas-visto-hoy'
        posts={data?.mostViewedToday ?? []}
        showSkeleton={showSkeleton}
      />
    </div>
  )
}
