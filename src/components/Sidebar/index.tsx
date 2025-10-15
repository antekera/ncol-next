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
    <aside className='sidebar'>
      <SocialLinks showBackground className='sidebar-social-links' />
      <Newsletter className='sidebar-newsletter' />
      {!isMobile && (
        <div className='sidebar-most-visited'>
          <MostVisitedPosts className='sidebar-most-visited' />
        </div>
      )}
      {children && <div className='sidebar-children'>{children}</div>}
      <Ad offsetTop={offsetTop} />
    </aside>
  )
}

export { Sidebar }