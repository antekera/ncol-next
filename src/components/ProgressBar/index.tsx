type ProgressBarProps = {
  percentage: number
}

const defaultProps = {
  percentage: 0,
}
const ProgressBar = ({ percentage }: ProgressBarProps) => {
  return (
    <div className='w-full h-1 bg-lightGray'>
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
