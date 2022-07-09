import cn from 'classnames'

type ContainerProps = {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
  tag?: string
}

const defaultProps = {
  tag: 'div',
}

const Container = ({ children, className, tag, sidebar }: ContainerProps) => {
  const classes = cn(
    'container px-6 sm:px-7 mx-auto',
    { flex: sidebar },
    className
  )

  const CustomTag = `${tag}` as keyof JSX.IntrinsicElements
  return (
    <CustomTag className={classes}>
      {sidebar ? (
        <section className='md:pr-8 md:w-2/3 lg:w-3/4'>{children}</section>
      ) : (
        <> {children}</>
      )}
      {sidebar && <aside className='px-2 md:w-1/3 lg:w-1/4'></aside>}
    </CustomTag>
  )
}

Container.defaultProps = defaultProps

export { Container }
export type { ContainerProps }
