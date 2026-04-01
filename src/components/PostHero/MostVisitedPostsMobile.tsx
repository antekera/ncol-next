'use client'

import { MostVisitedPosts } from '@components/MostVisitedPosts'

const MostVisitedPostsMobile = () => (
  <div className='my-6 md:hidden'>
    <MostVisitedPosts className='sidebar-most-visited' />
  </div>
)

export { MostVisitedPostsMobile }
