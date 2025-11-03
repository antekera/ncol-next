'use client'

import ContextStateData from '@lib/context/StateContext'
import { useScrollProgress } from '@lib/hooks/useScrollProgress'

const ProgressBar = () => {
  const { contentHeight, contentOffsetTop } = ContextStateData()
  const completion = useScrollProgress(contentHeight, contentOffsetTop)

  return (
    <div className='absolute -bottom-[4px] left-0 h-1 w-full bg-slate-200 dark:bg-neutral-600'>
      <div
        data-testid='progress-bar'
        style={{ width: `${completion}%` }}
        className='bg-primary h-full duration-500 ease-out dark:bg-neutral-400'
      />
    </div>
  )
}

export { ProgressBar }
