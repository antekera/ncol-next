'use client'

import { MostVisitedPosts } from '@components/MostVisitedPosts'

const MostVisitedPostsMobile = () => (
  <div className='my-6 md:hidden'>
    <MostVisitedPosts isLayoutMobile className='sidebar-most-visited' />
  </div>
)

export { MostVisitedPostsMobile }
