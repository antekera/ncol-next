import { getSkeletonClasses } from './styles'

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={getSkeletonClasses(className)} {...props} />
}

export { Skeleton }
