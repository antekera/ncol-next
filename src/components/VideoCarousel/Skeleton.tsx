import { cn } from '@lib/shared'

export const VideoCarouselSkeleton = ({
  className
}: {
  className?: string
}) => {
  return (
    <div
      className={cn(
        'relative -mx-3 mb-8 animate-pulse rounded-none border-x-0 border-y border-slate-800 bg-slate-950 px-0 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:px-6 sm:py-6 md:mr-2 md:ml-5',
        className
      )}
    >
      <div className='mb-6 flex items-center justify-between px-6 sm:px-0'>
        <div className='flex items-center gap-2.5'>
          <div className='h-9 w-9 rounded-lg bg-slate-800' />
          <div>
            <div className='h-5 w-40 rounded bg-slate-800' />
            <div className='mt-2 h-0.5 w-16 bg-slate-800' />
          </div>
        </div>
      </div>
      <div className='no-scrollbar mobile-centered-carousel flex gap-4 overflow-hidden'>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className='w-[290px] flex-none space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:w-[350px]'
          >
            <div className='aspect-video w-full rounded bg-slate-800' />
            <div className='space-y-2'>
              <div className='h-3.5 w-16 rounded bg-slate-800' />
              <div className='h-4 w-3/4 rounded bg-slate-800' />
              <div className='h-4 w-1/2 rounded bg-slate-800' />
            </div>
            <div className='mt-4 h-6 w-full rounded bg-slate-800/50' />
          </div>
        ))}
      </div>
    </div>
  )
}
