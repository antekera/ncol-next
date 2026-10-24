'use client'

import { MostVisitedPosts } from '@components/MostVisitedPosts'

const MostVisitedPostsMobile = ({
  homeMeasurement = false
}: {
  homeMeasurement?: boolean
}) => (
  <div className='my-6 md:hidden'>
    <MostVisitedPosts
      isLayoutMobile
      className='sidebar-most-visited'
      homeMeasurement={homeMeasurement}
    />
  </div>
)

export { MostVisitedPostsMobile }
