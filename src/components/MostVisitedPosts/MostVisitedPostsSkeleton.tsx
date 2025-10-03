import { Skeleton } from '@components/ui/skeleton'
import {
  getSkeletonItemClasses,
  getSkeletonImageClasses,
  getSkeletonContentClasses
} from './styles'

interface Props {
  isRow?: boolean
  limit?: number
  className?: string
}

const MostVisitedPostItemSkeleton = ({ isRow }: { isRow?: boolean }) => {
  return (
    <div className={getSkeletonItemClasses(isRow)}>
      <Skeleton className={getSkeletonImageClasses(isRow)} />

      <div className={getSkeletonContentClasses(isRow)}>
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
