import { useEffect } from 'react'

import { format } from 'date-fns'
import { useRouter } from 'next/router'

import { COMPANY_NAME, MENU, MENU_B, MENU_C } from 'lib/constants'
import { usePageStore } from 'lib/hooks/store'

import { SocialLinks } from '..'
import { CloseMenuButton } from './CloseMenuButton'
import { MenuLink } from './MenuLink'

const today: Date = new Date()

type SideNavProps = {
  isOpen: boolean
}

const defaultProps = {
  isOpen: false,
}

const SideNav = ({ isOpen }: SideNavProps) => {
  const { setPageSetupState } = usePageStore()

  const { asPath } = useRouter()

  const handleMenu = () => {
    setPageSetupState({
      isMenuActive: !isOpen,
    })
  }

  useEffect(() => {
    setPageSetupState({
      isMenuActive: false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asPath])

  return (
    <nav>
      <button
        onClick={handleMenu}
        className={`fixed inset-0 z-10 transition-opacity duration-500 ease-out ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-50 pointer-events-none'
        }`}
      >
        <div
          className={`inset-0 bg-black opacity-70 ${isOpen ? 'absolute' : ''}`}
        ></div>
      </button>
      <aside
        className={`fixed top-0 right-0 z-30 h-full overflow-auto bg-white border-l-4 w-full sm:w-80 drop-shadow-md ease-in-out transition-all duration-300 border-primary ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='px-6'>
          <CloseMenuButton onClick={handleMenu} />
        </div>
        <div className='px-8 py-1 content'>
          {MENU.map((name, index) => (
            <MenuLink name={name} key={index} />
          ))}
        </div>
        <div className='px-8 py-4 mt-3 content bg-zinc-100'>
          {MENU_B.map((name, index) => (
            <MenuLink name={name} key={index} />
          ))}
        </div>
        <div className='px-8 pt-6 pb-10 text-sm bg-darkBlue font-sans_light'>
          <div>
            {MENU_C.map((name, index) => (
              <MenuLink name={name} key={index} small staticPage />
            ))}
            <span className='block py-4 text-xs'>
              2012 - {format(today, 'yyyy')} &copy; {COMPANY_NAME}
            </span>
            <hr className='border-slate-600' />
            <div className='flex pt-4'>
              <SocialLinks />
            </div>
          </div>
        </div>
      </aside>
    </nav>
  )
}

SideNav.defaultProps = defaultProps

export { SideNav }
export type { SideNavProps }
