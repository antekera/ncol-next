import Sticky from 'react-stickynode'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { Newsletter } from '@components/Newsletter'

interface Props {
  adID: string
  adID2: string
}

const Sidebar = ({ adID, adID2 }: Partial<Props>) => {
  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      {adID && <AdDfpSlot id={adID} className='mb-4 show-mobile' />}
      <div className='show-desktop'>
        <Sticky enabled={true} top={84} bottomBoundary={'.footer'}>
          <AdDfpSlot id={adID2} className='mb-4' />
        </Sticky>
      </div>
      <Newsletter className='hidden md:block' />
    </aside>
  )
}

export { Sidebar }
