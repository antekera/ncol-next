import { AdSenseBanner } from '@components/AdSenseBanner'
import { Newsletter } from '@components/Newsletter'
import { ad } from '@lib/ads'

interface Props {
  children?: React.ReactNode
}

const Sidebar = ({ children }: Partial<Props>) => {
  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      <Newsletter className='hidden md:block' />
      {children && <div className='mb-4'>{children}</div>}
      <AdSenseBanner
        className='show-desktop mb-4 pt-4'
        {...ad.global.sidebar}
      />
    </aside>
  )
}

export { Sidebar }
