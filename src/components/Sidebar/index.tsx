'use client'

import { Newsletter } from '@components/Newsletter'
import { Ad } from '@components/Sidebar/Ad'
import { SocialLinks } from '@components/SocialLinks'
import { MostVisitedPosts } from '@components/MostVisitedPosts'
import { useIsMobile } from '@lib/hooks/useIsMobile'

interface Props {
  children?: React.ReactNode
  offsetTop?: number
}

const Sidebar = ({ children, offsetTop }: Partial<Props>) => {
  const isMobile = useIsMobile()

  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      <SocialLinks showBackground className='mb-6 hidden w-full md:flex' />
      <Newsletter className='hidden md:block' />
      {!isMobile && (
        <div className='mb-6'>
          <MostVisitedPosts className='sidebar-most-visited' />
        </div>
      )}
      {children && <div className='mb-4'>{children}</div>}
      <Ad offsetTop={offsetTop} />
    </aside>
  )
}

export { Sidebar }
