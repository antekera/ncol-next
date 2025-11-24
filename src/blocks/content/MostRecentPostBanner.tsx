'use client'

import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'
import { GAEvent } from '@lib/utils'
import { GA_EVENTS } from '@lib/constants'

const LoUltimoLabel = () => (
  <div className='flex shrink-0 items-center'>
    <span className='mr-2 text-xs text-red-500'>🔴</span>
    <span className='mr-2 hidden font-semibold sm:flex'>LO ÚLTIMO:</span>
  </div>
)

export const MostRecentPostBanner = () => {
  const { data, isLoading, error } = useMostVisitedPosts({
    load: true,
    limit: 10,
    days: 1
  })

  const post = data?.posts?.[0]

  if (!post || isLoading || error) {
    return null
  }

  return (
    <>
      <style jsx>{`
        .marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 12s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(-90%);
          }
        }
      `}</style>
      <HoverPrefetchLink
        href={post.slug}
        className='flex w-full items-center'
        onClick={() => {
          GAEvent({
            category: GA_EVENTS.POST_LINK.LAST_24_HOURS.CATEGORY,
            label: GA_EVENTS.POST_LINK.LAST_24_HOURS.LABEL
          })
        }}
      >
        <span className='mr-2 text-lg text-slate-500'>|</span>
        <LoUltimoLabel />
        <div className='w-full self-stretch overflow-hidden pt-[2px]'>
          <p className='marquee'>{post.title}</p>
        </div>
      </HoverPrefetchLink>
    </>
  )
}
