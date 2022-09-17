import cn from 'classnames'
import { isMobile } from 'react-device-detect'
import { useStickyBox } from 'react-sticky-box'

import { AdDfpSlot } from '@components/index'
import { AD_DFP_SIDEBAR, AD_DFP_SIDEBAR2 } from '@lib/ads'

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
  const stickyRef = useStickyBox({ offsetTop: 84, offsetBottom: 20 })

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
          {isMobile ? (
            <AdDfpSlot id={AD_DFP_SIDEBAR.ID} className='mb-4' />
          ) : (
            <div ref={stickyRef}>
              <AdDfpSlot id={AD_DFP_SIDEBAR2.ID} className='mb-4' />
            </div>
          )}
        </aside>
      )}
    </CustomTag>
  )
}

Container.defaultProps = defaultProps

export { Container }
export type { ContainerProps }
