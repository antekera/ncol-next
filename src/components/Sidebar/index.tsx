import { isMobile } from 'react-device-detect'
import { useStickyBox } from 'react-sticky-box'

import { Ads } from '@lib/types'

import { AdDfpSlot } from '..'

const Sidebar = ({ ads }: Ads) => {
  const stickyRef = useStickyBox({ offsetTop: 84, offsetBottom: 20 })
  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      {isMobile ? (
        <AdDfpSlot id={ads.sidebar.id} className='mb-4' />
      ) : (
        <div ref={stickyRef}>
          <AdDfpSlot id={ads.sidebar2.id} className='mb-4' />
        </div>
      )}
    </aside>
  )
}

export { Sidebar }
