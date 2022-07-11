import { useScrollProgress } from '@lib/hooks/useScrollProgress'

type ProgressBarProps = {
  contentHeight?: number
}

const ProgressBar = ({ contentHeight }: ProgressBarProps): JSX.Element => {
  const completion = useScrollProgress(
    contentHeight ?? document.body.scrollHeight
  )

  return (
    <div className='absolute left-0 w-full h-1 -bottom-[4px] bg-slate-200'>
      <div
        style={{ width: `${completion}%` }}
        className='h-full bg-primary ease-out duration-500'
      ></div>
    </div>
  )
}

export { ProgressBar }
