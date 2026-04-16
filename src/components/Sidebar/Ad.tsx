'use client'

import StickyBox from 'react-sticky-box'
import { NcolAdSlot } from '@components/NcolAdSlot'

const Ad = ({ offsetTop = 20 }) => {
  return (
    <StickyBox offsetTop={offsetTop} offsetBottom={20}>
      <div className='show-desktop'>
        <NcolAdSlot slot='sidebar' />
      </div>
    </StickyBox>
  )
}

export { Ad }
