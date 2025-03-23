import { AdSenseBanner } from '@components/AdSenseBanner'
import { Newsletter } from '@components/Newsletter'
import { ad } from '@lib/ads'
import { SOCIAL_LINKS } from '@lib/constants'

interface Props {
  children?: React.ReactNode
}

const Sidebar = ({ children }: Partial<Props>) => {
  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      <AdSenseBanner
        className='show-desktop mb-4 pt-4'
        {...ad.global.sidebar}
      />
      <Newsletter className='hidden md:block' />
      {children && <div className='mb-4'>{children}</div>}
      <div
        data-href={
          SOCIAL_LINKS.find(link => link.id === 'facebook')?.link ?? ''
        }
        data-tabs='timeline'
        data-width=''
        data-height=''
        data-small-header='true'
        data-adapt-container-width='true'
        data-hide-cover='true'
        data-show-facepile='true'
      />
    </aside>
  )
}

export { Sidebar }
