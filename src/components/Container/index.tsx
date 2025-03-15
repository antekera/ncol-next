import { JSX, ReactNode } from 'react'

import { cn } from '@lib/shared'

type ContainerProps = {
  children: ReactNode
  sidebar?: ReactNode
  className?: string
  tag?: string
}

const Container = ({
  children,
  className,
  tag = 'div',
  sidebar
}: ContainerProps) => {
  const classes = cn(
    'container mx-auto px-6 sm:px-7',
    { 'flex-none sm:flex sm:flex-row sm:flex-wrap': sidebar },
    className
  )
  const CustomTag = `${tag}` as keyof JSX.IntrinsicElements

  return <CustomTag className={classes}>{children}</CustomTag>
}

export { Container }
