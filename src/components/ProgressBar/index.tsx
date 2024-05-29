'use client'

import { usePageStore } from '@lib/hooks/store'
import { useScrollProgress } from '@lib/hooks/useScrollProgress'

const ProgressBar = () => {
  const contentHeight = usePageStore(state => state.contentHeight) ?? 1
  const completion = useScrollProgress(contentHeight)

  return (
    <div className='absolute -bottom-[4px] left-0 h-1 w-full bg-slate-200'>
      <div
        data-testid='progress-bar'
        style={{ width: `${completion}%` }}
        className='h-full bg-primary duration-500 ease-out'
      />
    </div>
  )
}

export { ProgressBar }
