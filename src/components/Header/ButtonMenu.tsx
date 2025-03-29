'use client'

import { Menu } from 'lucide-react'
import { useEffect } from 'react'
import ContextStateData from '@lib/context/StateContext'
import { GAEvent } from '@lib/utils'

type ButtonMenuProps = {
  isHeaderPrimary: boolean
}

const MENU_TEXT = 'Menú'
const ARIA_LABEL = 'menú de categorías y búsqueda'

const ButtonMenu = ({ isHeaderPrimary }: ButtonMenuProps) => {
  const { isMenuActive, handleSetContext } = ContextStateData()

  const handleMenu = () => {
    GAEvent({
      category: 'MENU',
      label: 'OPEN_MENU'
    })
    handleSetContext({
      isMenuActive: !isMenuActive
    })
  }

  useEffect(() => {
    const body = document.querySelector('body')
    if (isMenuActive) {
      body?.classList.add('active-menu')
    } else {
      body?.classList.remove('active-menu')
    }
  }, [isMenuActive])

  return (
    <button
      aria-haspopup='true'
      aria-expanded={isMenuActive}
      aria-label={ARIA_LABEL}
      type='button'
      onClick={handleMenu}
      className={`menu ease focus:shadow-outline flex cursor-pointer items-center rounded-md border-none bg-transparent px-2 font-sans text-sm text-slate-700 duration-200 hover:bg-gray-100 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-gray-700 dark:hover:text-white ${
        isHeaderPrimary ? 'text-slate-700' : ''
      }`}
    >
      <span className='hidden pr-2 md:block'>{MENU_TEXT}</span>
      <Menu size={32} />
    </button>
  )
}

export { ButtonMenu }
