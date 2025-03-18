'use client'

import ContextStateData from '@lib/context/StateContext'
import { useScrollProgress } from '@lib/hooks/useScrollProgress'

const ProgressBar = () => {
  const { contentHeight } = ContextStateData()
  const completion = useScrollProgress(contentHeight)

  return (
    <div className='absolute -bottom-[4px] left-0 h-1 w-full bg-slate-200'>
      <div
        data-testid='progress-bar'
        style={{ width: `${completion}%` }}
        className='bg-primary h-full duration-500 ease-out'
      />
    </div>
  )
}

export { ProgressBar }
