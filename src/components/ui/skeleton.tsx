import { cn } from '@lib/shared'

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('skeleton', className)} {...props} />
}

export { Skeleton }