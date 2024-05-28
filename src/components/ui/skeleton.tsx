import { cn } from '@lib/shared'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse bg-gray-200 dark:bg-gray-900', className)}
      {...props}
    />
  )
}

export { Skeleton }
