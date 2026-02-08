'use client'

import { Menu } from 'lucide-react'
import { useEffect } from 'react'
import ContextStateData from '@lib/context/StateContext'
import { GAEvent } from '@lib/utils'
import { GA_EVENTS } from '@lib/constants'
import { getThemeSwitchClassName } from '@components/Header/styles'

type Props = {
  isHeaderPrimary: boolean
}

const MENU_TEXT = 'Menú'
const ARIA_LABEL = 'menú de categorías y búsqueda'

const ButtonMenu = ({ isHeaderPrimary }: Props) => {
  const { isMenuActive, handleSetContext } = ContextStateData()

  const baseClassName = getThemeSwitchClassName({ isHeaderPrimary })

  const handleMenu = () => {
    GAEvent({
      category: GA_EVENTS.MENU.CATEGORY,
      label: GA_EVENTS.MENU.OPEN_MENU
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
      className={`${baseClassName} menu md:w-22`}
    >
      <span className='-mr-1 hidden pr-2 font-sans text-sm md:block'>
        {MENU_TEXT}
      </span>
      <Menu size={32} />
    </button>
  )
}

export { ButtonMenu }
