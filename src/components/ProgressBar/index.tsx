'use client'

import ContextStateData from '@lib/context/StateContext'
import { useScrollProgress } from '@lib/hooks/useScrollProgress'

const ProgressBar = () => {
  const { contentHeight } = ContextStateData()
  const completion = useScrollProgress(contentHeight)

  return (
    <div className='progress-bar-container'>
      <div
        data-testid='progress-bar'
        style={{ width: `${completion}%` }}
        className='progress-bar'
      />
    </div>
  )
}

export { ProgressBar }