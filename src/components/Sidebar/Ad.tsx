'use client'

import StickyBox from 'react-sticky-box'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { ad } from '@lib/ads'

const Ad = ({ offsetTop = 20 }) => {
  return (
    <StickyBox offsetTop={offsetTop} offsetBottom={20}>
      <AdSenseBanner className='show-desktop' {...ad.global.sidebar} />
    </StickyBox>
  )
}

export { Ad }
