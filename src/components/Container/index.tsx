import React, { ReactNode } from 'react'

import cn from 'classnames'

type ContainerProps = {
  children: ReactNode
  sidebar?: ReactNode
  className?: string
  tag?: string
}

const defaultProps = {
  tag: 'div'
}

const Container = ({ children, className, tag, sidebar }: ContainerProps) => {
  const classes = cn(
    'container px-6 sm:px-7 mx-auto',
    { 'flex-none sm:flex sm:flex-row sm:flex-wrap': sidebar },
    className
  )
  const CustomTag = `${tag}` as keyof JSX.IntrinsicElements

  return <CustomTag className={classes}>{children}</CustomTag>
}

Container.defaultProps = defaultProps

export { Container }
export type { ContainerProps }
