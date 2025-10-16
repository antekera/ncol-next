import { cn } from '@lib/shared'
import './skeleton.css'

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('skeleton', className)} {...props} />
}

export { Skeleton }