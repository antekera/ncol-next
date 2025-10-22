'use client'

import Link from 'next/link'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'

const LoUltimoLabel = () => (
  <div className='flex shrink-0 items-center'>
    <span className='mr-2 text-xs text-red-500'>🔴</span>
    <span className='mr-2 font-semibold'>LO ÚLTIMO:</span>
  </div>
)

export const MostRecentPostBanner = () => {
  const { data, isLoading, error } = useMostVisitedPosts({
    load: true,
    limit: 1,
    days: 1
  })

  const post = data?.posts?.[0]

  if (error) {
    return null
  }

  if (isLoading) {
    return (
      <div className='flex w-full items-center'>
        <LoUltimoLabel />
      </div>
    )
  }

  if (!post) {
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
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
      <Link href={`/post/${post.slug}`} className='flex w-full items-center'>
        <LoUltimoLabel />
        <div className='w-full self-stretch overflow-hidden pt-[2px]'>
          <p className='marquee'>{post.title}</p>
        </div>
      </Link>
    </>
  )
}
