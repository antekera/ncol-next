'use client'

import Link from 'next/link'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'
import { Skeleton } from '@components/ui/skeleton'

const MostRecentPostBanner = () => {
  const { data, isLoading, error } = useMostVisitedPosts({
    limit: 1,
    period: '24h'
  })

  if (isLoading) {
    return <Loading />
  }

  if (error || !data || !data.results || data.results.length === 0) {
    return null
  }

  const post = data.results[0]

  return (
    <>
      <style jsx>{`
        .marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 15s linear infinite;
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
      <Link href={`/post/${post.slug}`} className='overflow-hidden w-full'>
        <div className='flex items-center'>
          <span className='mr-2 text-red-500'>🔴</span>
          <span className='font-semibold mr-2'>LO ÚLTIMO:</span>
          <span className='marquee'>{post.title}</span>
        </div>
      </Link>
    </>
  )
}

function Loading() {
  return (
    <div className='flex items-center w-full' data-testid="loading-skeleton">
      <Skeleton className='h-4 w-1/4 rounded' />
    </div>
  )
}

export default MostRecentPostBanner
