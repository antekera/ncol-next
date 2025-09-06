import { cn } from '@lib/shared'
import { ClassValue } from 'clsx'

type ContainerClassesProps = {
  sidebar?: boolean
  className?: ClassValue
}

export const getContainerClasses = ({
  sidebar,
  className
}: ContainerClassesProps) =>
  cn(
    'container mx-auto px-6 sm:px-7',
    { 'flex-none sm:flex sm:flex-row sm:flex-wrap': sidebar },
    className
  )
