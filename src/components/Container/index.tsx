import classNames from 'classnames'

type ContainerProps = {
  children: React.ReactNode
  className?: string
  tag?: string
}

const defaultProps = {
  tag: 'div',
}

const Container = ({ children, className, tag }: ContainerProps) => {
  const classes = classNames('container px-5 mx-auto', className)
  const CustomTag = `${tag}` as keyof JSX.IntrinsicElements
  return <CustomTag className={classes}>{children}</CustomTag>
}

Container.defaultProps = defaultProps

export { Container }
export type { ContainerProps }
