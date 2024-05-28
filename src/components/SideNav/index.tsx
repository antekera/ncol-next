'use client'

import { useEffect, useMemo } from 'react'

import { format } from 'date-fns'
import { usePathname } from 'next/navigation'

import { SocialLinks } from '@components/SocialLinks'
import { COMPANY_NAME, MENU, MENU_B, MENU_C } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { GAEvent } from '@lib/utils/ga'

import { CloseMenuButton } from './CloseMenuButton'
import { MenuLink } from './MenuLink'

const SideNav = () => {
  const isMenuActive = usePageStore(state => state.isMenuActive)
  const { setPageSetupState } = usePageStore()
  const today = new Date()

  const pathname = usePathname()

  const handleMenu = () => {
    GAEvent({
      category: 'MENU',
      label: 'CLOSE_MENU'
    })
    setPageSetupState({
      isMenuActive: !isMenuActive
    })
  }

  const menuA = useMemo(
    () => MENU.map(name => <MenuLink name={name} key={name} />),
    [MENU]
  )
  const menuB = useMemo(
    () => MENU_B.map(name => <MenuLink name={name} key={name} />),
    [MENU_B]
  )
  const menuC = useMemo(
    () =>
      MENU_C.map(name => (
        <MenuLink name={name} key={name} small staticPage bgDark />
      )),
    [MENU_C]
  )

  useEffect(() => {
    setPageSetupState({
      isMenuActive: false
    })
  }, [pathname])

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
        className={`fixed right-0 top-0 z-30 h-full w-full overflow-auto border-l-4 border-solid border-primary bg-white transition-all duration-300 ease-in-out sm:w-80 ${
          isMenuActive ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='px-6'>
          <CloseMenuButton onClick={handleMenu} />
        </div>
        <div className='content px-8 py-1'>{menuA}</div>
        <div className='content mt-3 bg-zinc-100 px-8 py-4'>{menuB}</div>
        <div className='bg-darkBlue px-8 pb-10 pt-6 font-sans text-sm'>
          <div>
            {menuC}
            <span className='block py-4 text-xs'>
              2012 - {today && format(today, 'yyyy')} &copy; {COMPANY_NAME}
            </span>
            <hr className='border-solid border-slate-600' />
            <div className='flex pt-4'>
              <SocialLinks />
            </div>
          </div>
        </div>
      </aside>
    </nav>
  )
}

export { SideNav }
