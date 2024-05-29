import { Skeleton } from '@components/ui/skeleton'

const CategorySkeleton = () => (
  <section className='relative mb-6 flex w-full flex-row border-b border-slate-200 py-6 pt-0'>
    <div className='mr-3 w-20 flex-1 pt-2 sm:mr-5'>
      <div className='mb-5 flex w-full flex-col space-y-2'>
        <Skeleton className='h-5' />
        <Skeleton className='mb-4 block h-5 w-4/5' />
      </div>
      <div className='mb-5 flex w-full flex-col space-y-2'>
        <Skeleton className='h-3 w-5/6' />
      </div>
      <div className='mb-5 flex w-3/5 w-full flex-col space-y-2'>
        <Skeleton className='h-3' />
      </div>
    </div>
    <div className='sm:h-28 sm:w-40 lg:h-40 lg:w-60'>
      <Skeleton className='h-full w-full' />
    </div>
  </section>
)

const Loading = () => {
  const loadingArray = Array(3).fill(null)

  return (
    <>
      {loadingArray.map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </>
  )
}

export { Loading }
