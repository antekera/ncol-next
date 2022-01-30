import classNames from 'classnames'

export interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export const Container = ({ children, className }: ContainerProps) => {
  const classes = classNames('container px-5 mx-auto', className)
  return <div className={classes}>{children}</div>
}
