import { MenuIcon } from '@heroicons/react/outline'

type ButtonMenuProps = {
  handleMenu: () => void
  isHeaderPrimary: boolean
  isMenuActive?: boolean
}

const MENU_TEXT = 'Menú'
const ARIA_LABEL = 'menú de categorías y búsqueda'

const ButtonMenu = ({
  isHeaderPrimary,
  handleMenu,
  isMenuActive,
}: ButtonMenuProps) => {
  return (
    <button
      aria-haspopup='true'
      aria-expanded={isMenuActive}
      aria-label={ARIA_LABEL}
      type='button'
      onClick={handleMenu}
      className={`border-solid border-none flex items-center text-sm menu ease duration-300 text-slate-700 focus:shadow-outline pl-2 ${
        isHeaderPrimary
          ? 'text-zinc-100 hover:text-secondary'
          : 'hover:text-primary'
      }`}
    >
      <span className='hidden pr-2 md:block'>{MENU_TEXT}</span>
      <MenuIcon className='cursor-pointer w-7 h-7 p2' />
    </button>
  )
}

export { ButtonMenu }
