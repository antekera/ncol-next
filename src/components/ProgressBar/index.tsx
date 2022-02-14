type ProgressBarProps = {
  percentage: number
}

const defaultProps = {
  percentage: 0,
}
const ProgressBar = ({ percentage }: ProgressBarProps) => {
  return (
    <div className='absolute left-0 w-full h-1 -bottom-[4px] bg-slate-200'>
      <div
        style={{ width: `${percentage}%` }}
        className='h-full bg-primary'
      ></div>
    </div>
  )
}

ProgressBar.defaultProps = defaultProps

export { ProgressBar }
export type { ProgressBarProps }
