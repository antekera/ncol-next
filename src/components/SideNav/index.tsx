import { useEffect } from 'react'

import { format } from 'date-fns'
import { useRouter } from 'next/router'

import { SocialLinks } from '@components/SocialLinks'
import { COMPANY_NAME, MENU, MENU_B, MENU_C } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { GAEvent } from '@lib/utils/ga'

import { CloseMenuButton } from './CloseMenuButton'
import { MenuLink } from './MenuLink'

type SideNavProps = {
  isOpen?: boolean
}

const SideNav = ({ isOpen = false }: SideNavProps) => {
  const { setPageSetupState, today } = usePageStore()

  const { asPath } = useRouter() || { asPath: '' }

  const handleMenu = () => {
    GAEvent({
      category: 'MENU',
      label: 'CLOSE_MENU'
    })
    setPageSetupState({
      isMenuActive: !isOpen
    })
  }

  useEffect(() => {
    setPageSetupState({
      isMenuActive: false
    })
  }, [asPath])

  return (
    <nav>
      <div
        onClick={handleMenu}
        aria-hidden='true'
        className={`link-menu-button-open absolute z-20 h-screen w-full bg-black transition-opacity duration-100 ease-in ${
          isOpen
            ? 'pointer-events-auto opacity-70'
            : 'pointer-events-none h-0 w-0 opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-30 h-full w-full overflow-auto border-l-4 border-solid border-primary bg-white transition-all duration-300 ease-in-out sm:w-80 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='px-6'>
          <CloseMenuButton onClick={handleMenu} />
        </div>
        <div className='content px-8 py-1'>
          {MENU.map((name, index) => (
            <MenuLink name={name} key={index} />
          ))}
        </div>
        <div className='content mt-3 bg-zinc-100 px-8 py-4'>
          {MENU_B.map((name, index) => (
            <MenuLink name={name} key={index} />
          ))}
        </div>
        <div className='bg-darkBlue px-8 pb-10 pt-6 font-sans text-sm'>
          <div>
            {MENU_C.map((name, index) => (
              <MenuLink name={name} key={index} small staticPage bgDark />
            ))}
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
