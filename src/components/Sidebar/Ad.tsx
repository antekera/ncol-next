'use client'

import StickyBox from 'react-sticky-box'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { ad } from '@lib/ads'

const Ad = ({ offsetTop = 20 }) => {
  return (
    <StickyBox offsetTop={offsetTop} offsetBottom={20}>
      <div className='show-desktop'>
        <AdSenseBanner {...ad.global.sidebar} />
      </div>
    </StickyBox>
  )
}

export { Ad }
