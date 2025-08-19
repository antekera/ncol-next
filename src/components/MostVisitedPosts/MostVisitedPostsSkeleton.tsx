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
      className={cn(
        'flex',
        isRow ? 'flex-row items-center space-x-3' : 'flex-col space-y-2'
      )}
    >
      <Skeleton
        className={cn(
          isRow
            ? 'h-16 w-20 flex-shrink-0 sm:h-20 sm:w-24'
            : 'h-32 w-full sm:h-40'
        )}
      />

      <div className={cn('flex-1 space-y-2', isRow ? '' : 'px-2 pb-2')}>
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
