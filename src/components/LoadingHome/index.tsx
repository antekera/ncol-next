import { Skeleton } from '@components/ui/skeleton'

export function RightPostsSkeleton() {
  return (
    <>
      <Skeleton className='h-24 w-full' />
      <div className='space-y-2 py-4'>
        <Skeleton className='h-3 w-1/4' />
        <Skeleton className='h-3 w-11/12' />
        <Skeleton className='h-3 w-2/3' />
      </div>
    </>
  )
}

export function LeftPostsSkeleton() {
  return (
    <>
      <div className='relative'>
        <Skeleton className='h-32 w-full' />
        <div className='absolute -top-2 left-0 z-10 h-6 w-20 bg-white pl-2 md:top-auto md:-bottom-1 dark:bg-neutral-900' />
      </div>
      <div className='space-y-2 py-4'>
        <Skeleton className='h-4 w-11/12' />
        <Skeleton className='h-4 w-2/3' />
      </div>
      <hr className='relative mt-4 mb-3 w-2/3 text-slate-200 md:mt-0 lg:w-3/4 dark:border-neutral-500 dark:bg-neutral-300' />
    </>
  )
}

export function CoverPostSkeleton() {
  return (
    <div className='-mx-6 flex flex-col space-y-3 sm:mx-0'>
      <Skeleton className='h-52 w-full sm:h-44 lg:h-64' />
      <div className='border-primary relative -top-14 z-2 mt-4 border-t-4 bg-white px-5 py-4 sm:w-11/12 dark:bg-neutral-800'>
        <div className='space-y-2 pb-3'>
          <Skeleton className='mb-3 h-3 w-32' />
          <Skeleton className='h-5 w-11/12' />
          <Skeleton className='h-5 w-2/3' />
        </div>
        <hr className='w-48 text-slate-200 md:w-80 dark:border-neutral-500' />
        <div className='space-y-2 pt-3'>
          <Skeleton className='h-2 w-11/12' />
          <Skeleton className='h-2 w-2/3' />
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <section className='md:w-2/3 md:pr-8 lg:w-3/4'>
      <CoverPostSkeleton />
      <section className='flex flex-col pb-12 md:flex-row'>
        <div className='w-full md:w-3/5 md:pr-3 md:pl-5'>
          <LeftPostsSkeleton />
        </div>
        <div className='w-full md:w-2/5 md:pl-4'>
          <RightPostsSkeleton />
          <RightPostsSkeleton />
        </div>
      </section>
    </section>
  )
}

export { Loading }
