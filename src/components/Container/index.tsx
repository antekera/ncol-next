import { JSX, ReactNode } from 'react'
import { getContainerClasses } from './styles'

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
  const classes = getContainerClasses({ sidebar: !!sidebar, className })
  const CustomTag = `${tag}` as keyof JSX.IntrinsicElements

  return <CustomTag className={classes}>{children}</CustomTag>
}

export { Container }
