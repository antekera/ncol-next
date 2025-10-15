'use client'

import { useEffect } from 'react'
import { format } from 'date-fns'
import { usePathname } from 'next/navigation'
import { Search } from '@components/Search'
import { SocialLinks } from '@components/SocialLinks'
import { COMPANY_NAME, GA_EVENTS, MENU, MENU_B, MENU_C } from '@lib/constants'
import ContextStateData from '@lib/context/StateContext'
import { GAEvent } from '@lib/utils/ga'
import { CloseMenuButton } from './CloseMenuButton'
import { MenuLink } from './MenuLink'
import { cn } from '@lib/shared'

const SideNav = () => {
  const { isMenuActive, handleSetContext } = ContextStateData()
  const today = new Date()

  const pathname = usePathname()

  const handleMenu = () => {
    GAEvent({
      category: GA_EVENTS.MENU.CATEGORY,
      label: GA_EVENTS.MENU.CLOSE_MENU
    })
    handleSetContext({
      isMenuActive: !isMenuActive
    })
  }

  const menuA = MENU.map(item => <MenuLink item={item} key={item.name} />)
  const menuB = MENU_B.map(item => <MenuLink item={item} key={item.name} />)
  const menuC = MENU_C.map(item => (
    <MenuLink item={item} key={item.name} small bgDark />
  ))
  let menuClass = 'side-nav-inactive'
  if (isMenuActive !== undefined) {
    menuClass = isMenuActive ? 'side-nav-active' : 'side-nav-inactive'
  }

  useEffect(() => {
    handleSetContext({
      isMenuActive: false
    })
  }, [pathname, handleSetContext])

  return (
    <nav>
      <button
        onClick={handleMenu}
        className={cn('side-nav-overlay', {
          'side-nav-overlay-active': isMenuActive,
          'side-nav-overlay-inactive': !isMenuActive
        })}
      />
      <aside className={cn('side-nav', menuClass)}>
        <div className='side-nav-content'>
          <div className='side-nav-close-button-wrapper'>
            <CloseMenuButton onClick={handleMenu} />
          </div>

          <div className='side-nav-main-content'>
            {pathname !== '/busqueda' ? (
              <div className='side-nav-search-wrapper'>
                <Search />
              </div>
            ) : (
              <div className='side-nav-search-wrapper-alt'></div>
            )}
            <div className='side-nav-menu-a'>{menuA}</div>
            <div className='side-nav-menu-b'>{menuB}</div>
          </div>
          <div className='side-nav-footer'>
            <div>
              <div className='side-nav-footer-content'>{menuC}</div>
              <span className='side-nav-footer-copyright'>
                2012 - {today && format(today, 'yyyy')} &copy; {COMPANY_NAME}
              </span>
              <hr className='side-nav-footer-separator' />
              <div className='side-nav-footer-social-links'>
                <SocialLinks />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </nav>
  )
}

export { SideNav }