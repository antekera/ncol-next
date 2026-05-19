export const MatchCardSkeleton = () => (
  <div className='animate-pulse rounded-lg bg-[#0d1f3c]/60 p-3 ring-1 ring-white/5'>
    <div className='mb-3 flex justify-between'>
      <div className='h-2.5 w-16 rounded bg-white/10' />
      <div className='h-2.5 w-24 rounded bg-white/10' />
    </div>
    <div className='flex items-center gap-2'>
      <div className='flex flex-1 flex-col items-center gap-2'>
        <div className='h-8 w-8 rounded-full bg-white/10' />
        <div className='h-2.5 w-16 rounded bg-white/10' />
      </div>
      <div className='flex w-24 flex-col items-center gap-2'>
        <div className='h-7 w-16 rounded bg-white/10' />
        <div className='h-2.5 w-10 rounded bg-white/10' />
      </div>
      <div className='flex flex-1 flex-col items-center gap-2'>
        <div className='h-8 w-8 rounded-full bg-white/10' />
        <div className='h-2.5 w-16 rounded bg-white/10' />
      </div>
    </div>
  </div>
)

export const MatchesSkeleton = () => (
  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
    {Array.from({ length: 6 }).map((_, i) => (
      <MatchCardSkeleton key={i} />
    ))}
  </div>
)

export const GroupStandingsSkeleton = () => (
  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className='animate-pulse overflow-hidden rounded-lg ring-1 ring-white/10'
      >
        <div className='h-8 bg-[#0d1f3c]/90' />
        {Array.from({ length: 4 }).map((_, j) => (
          <div
            key={j}
            className='flex items-center gap-2 border-t border-white/5 px-3 py-2'
          >
            <div className='h-3 w-4 rounded bg-white/10' />
            <div className='h-5 w-5 rounded-full bg-white/10' />
            <div className='h-3 flex-1 rounded bg-white/10' />
            <div className='ml-auto flex gap-3'>
              {Array.from({ length: 5 }).map((_, k) => (
                <div key={k} className='h-3 w-4 rounded bg-white/10' />
              ))}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
)
