import { usePageStore } from '@lib/hooks/store'
import { useScrollProgress } from '@lib/hooks/useScrollProgress'

const ProgressBar = (): JSX.Element => {
  const contentHeight = usePageStore(state => state.contentHeight) ?? 1
  const completion = useScrollProgress(contentHeight)

  return (
    <div className='absolute left-0 w-full h-1 -bottom-[4px] bg-slate-200'>
      <div
        data-testid='progress-bar'
        style={{ width: `${completion}%` }}
        className='h-full bg-primary ease-out duration-500'
      />
    </div>
  )
}

export { ProgressBar }
