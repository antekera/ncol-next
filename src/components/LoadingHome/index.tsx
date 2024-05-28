import { Skeleton } from '@components/ui/skeleton'

function Loading() {
  return (
    <section className='md:w-2/3 md:pr-8 lg:w-3/4'>
      <div className='-mx-6 flex flex-col space-y-3 sm:mx-0'>
        <Skeleton className='h-52 w-full sm:h-44 lg:h-64' />
        <div className='z-2 relative -top-14 mt-4 border-t-4 border-primary bg-white px-5 pt-4 sm:w-11/12'>
          <div className='space-y-2 pb-3'>
            <Skeleton className='mb-3 h-3 w-32' />
            <Skeleton className='h-5 w-11/12' />
            <Skeleton className='h-5 w-2/3' />
          </div>
          <hr className='w-48 text-slate-200 md:w-80' />
          <div className='space-y-2 pt-3'>
            <Skeleton className='h-2 w-11/12' />
            <Skeleton className='h-2 w-2/3' />
          </div>
        </div>
      </div>
      <section className='flex flex-col pb-12 md:flex-row'>
        <div className='w-full md:w-3/5 md:pl-5 md:pr-3'>
          <div className='relative'>
            <Skeleton className='h-32 w-full' />
            <div className='absolute -top-2 left-0 z-10 h-6 w-20 bg-white pl-2 md:-bottom-1 md:top-auto'></div>
          </div>
          <div className='space-y-2 py-4'>
            <Skeleton className='h-4 w-11/12' />
            <Skeleton className='h-4 w-2/3' />
          </div>
          <hr className='relative mb-3 mt-4 w-2/3 text-slate-200 md:mt-0 lg:w-3/4'></hr>
        </div>
        <div className='w-full md:w-2/5 md:pl-4'>
          <Skeleton className='h-24 w-full' />
          <div className='space-y-2 py-4'>
            <Skeleton className='h-3 w-1/4' />
            <Skeleton className='h-3 w-11/12' />
            <Skeleton className='h-3 w-2/3' />
          </div>
        </div>
      </section>
    </section>
  )
}

export { Loading }
