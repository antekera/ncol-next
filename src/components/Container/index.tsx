import { JSX, ReactNode } from 'react'
import { cn } from '@lib/shared'
import './container.css'

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
  const CustomTag = `${tag}` as keyof JSX.IntrinsicElements

  return (
    <CustomTag
      className={cn(
        'container',
        { 'container-sidebar': sidebar },
        className
      )}
    >
      {children}
    </CustomTag>
  )
}

export { Container }