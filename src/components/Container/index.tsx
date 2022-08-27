import cn from 'classnames'

import { AdSlot } from '@components/index'
import { AD_LATERAL_A1, AD_LATERAL_A2, AD_LATERAL_A3 } from '@lib/constants'

type ContainerProps = {
  children: React.ReactNode
  sidebar?: React.ReactNode
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
  return (
    <CustomTag className={classes}>
      {sidebar ? (
        <section className='w-full md:pr-8 md:w-2/3 lg:w-3/4'>
          {children}
        </section>
      ) : (
        <> {children}</>
      )}
      {sidebar && (
        <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
          <AdSlot id={AD_LATERAL_A1} />
          <AdSlot id={AD_LATERAL_A2} />
          <AdSlot id={AD_LATERAL_A3} />
        </aside>
      )}
    </CustomTag>
  )
}

Container.defaultProps = defaultProps

export { Container }
export type { ContainerProps }
