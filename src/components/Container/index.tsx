import { AdSlot } from '@sect/react-dfp'
import cn from 'classnames'

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
          <div className='mb-4 bloque-adv square'>
            <AdSlot
              slotId={`div-gpt-ad-${AD_LATERAL_A1}`}
              sizes={[[320, 250]]}
              adUnit='lateral_a1'
            />
          </div>
          <div className='mb-4 bloque-adv square'>
            <AdSlot
              slotId={`div-gpt-ad-${AD_LATERAL_A2}`}
              sizes={[[320, 250]]}
              adUnit='lateral_a2'
            />
          </div>
          <div className='mb-4 bloque-adv square'>
            <AdSlot
              slotId={`div-gpt-ad-${AD_LATERAL_A3}`}
              sizes={[[320, 250]]}
              adUnit='lateral_a3'
            />
          </div>
        </aside>
      )}
    </CustomTag>
  )
}

Container.defaultProps = defaultProps

export { Container }
export type { ContainerProps }
