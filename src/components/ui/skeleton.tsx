import { cn } from '@lib/shared'

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('animate-pulse bg-gray-300 dark:bg-neutral-600', className)}
      {...props}
    />
  )
}

export { Skeleton }
