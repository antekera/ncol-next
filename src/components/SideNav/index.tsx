'use client'

import { useEffect } from 'react'
import { format } from 'date-fns'
import { usePathname } from 'next/navigation'
import { Search } from '@components/Search'
import { SocialLinks } from '@components/SocialLinks'
import { COMPANY_NAME, MENU, MENU_B, MENU_C } from '@lib/constants'
import ContextStateData from '@lib/context/StateContext'
import { GAEvent } from '@lib/utils/ga'
import { CloseMenuButton } from './CloseMenuButton'
import { MenuLink } from './MenuLink'

const SideNav = () => {
  const { isMenuActive, handleSetContext } = ContextStateData()
  const today = new Date()

  const pathname = usePathname()

  const handleMenu = () => {
    GAEvent({
      category: 'MENU',
      label: 'CLOSE_MENU'
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
  let menuClass = 'hidden'
  if (isMenuActive !== undefined) {
    menuClass = isMenuActive ? 'translate-x-0' : 'translate-x-full'
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
        className={`link-menu-button-open absolute z-20 h-screen w-full bg-black transition-opacity duration-100 ease-in ${
          isMenuActive
            ? 'pointer-events-auto opacity-70'
            : 'pointer-events-none h-0 w-0 opacity-0'
        }`}
      />
      <aside
        className={`border-primary fixed top-0 right-0 z-30 h-full w-80 overflow-auto border-l-4 border-solid bg-white transition-all duration-300 ease-in-out dark:bg-neutral-800 ${
          menuClass
        }`}
      >
        <div className='flex h-full flex-col'>
          <div className='px-6'>
            <CloseMenuButton onClick={handleMenu} />
          </div>

          <div className='flex flex-1 flex-col'>
            {pathname !== '/busqueda' ? (
              <div className='border-y-2 border-solid border-slate-300 px-6 py-4 dark:border-neutral-600'>
                <Search />
              </div>
            ) : (
              <div className='border-t-2 border-solid border-slate-300 px-6'></div>
            )}
            <div className='space-2 flex flex-col gap-1 px-8 py-4'>{menuA}</div>
            <div className='flex flex-1 flex-col gap-1 bg-zinc-100 px-8 py-4 dark:bg-neutral-900'>
              {menuB}
            </div>
          </div>
          <div className='bg-dark-blue px-8 pt-6 pb-10 text-sm dark:bg-neutral-950'>
            <div>
              <div className='flex flex-col gap-1'>{menuC}</div>
              <span className='block py-4 font-sans text-xs'>
                2012 - {today && format(today, 'yyyy')} &copy; {COMPANY_NAME}
              </span>
              <hr className='border-solid border-slate-600 dark:border-neutral-500' />
              <div className='flex pt-4'>
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
