import { Skeleton } from '@components/ui/skeleton'
import { cn } from '@lib/shared'

interface Props {
  isRow?: boolean
  limit?: number
  className?: string
}

const MostVisitedPostItemSkeleton = ({ isRow }: { isRow?: boolean }) => {
  return (
    <div
      className={cn('most-visited-posts-skeleton-item', {
        'most-visited-posts-skeleton-item-row': isRow,
        'most-visited-posts-skeleton-item-column': !isRow
      })}
    >
      <Skeleton
        className={cn('most-visited-posts-skeleton-image', {
          'most-visited-posts-skeleton-image-row': isRow,
          'most-visited-posts-skeleton-image-column': !isRow
        })}
      />

      <div
        className={cn('most-visited-posts-skeleton-content', {
          'most-visited-posts-skeleton-content-row': isRow,
          'most-visited-posts-skeleton-content-column': !isRow
        })}
      >
        <div className='space-y-1'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>

        <Skeleton className='h-3 w-1/3' />
      </div>
    </div>
  )
}

const MostVisitedPostsSkeleton = ({ isRow, limit = 5, className }: Props) => {
  return (
    <>
      {Array.from({ length: limit }).map((_, index) => (
        <div key={index} className={className}>
          <MostVisitedPostItemSkeleton isRow={isRow} />
        </div>
      ))}
    </>
  )
}

export { MostVisitedPostsSkeleton, MostVisitedPostItemSkeleton }