import { useStickyBox } from 'react-sticky-box'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { Ads } from '@lib/types'

const Sidebar = ({ ads }: Ads) => {
  const stickyRef = useStickyBox({ offsetTop: 84, offsetBottom: 20 })
  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      <AdDfpSlot id={ads.sidebar.id} className='mb-4 show-mobile' />
      <div className='show-desktop' ref={stickyRef}>
        <AdDfpSlot id={ads.sidebar2.id} className='mb-4' />
      </div>
    </aside>
  )
}

export { Sidebar }
