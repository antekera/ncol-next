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
  isMenuActive
}: ButtonMenuProps) => {
  return (
    <button
      aria-haspopup='true'
      aria-expanded={isMenuActive}
      aria-label={ARIA_LABEL}
      type='button'
      onClick={handleMenu}
      className={`menu ease focus:shadow-outline flex items-center border-none pl-2 font-sans text-sm text-slate-700 duration-200 ${
        isHeaderPrimary
          ? 'text-zinc-100 hover:text-secondary'
          : 'hover:text-primary'
      }`}
    >
      <span className='hidden pr-2 md:block'>{MENU_TEXT}</span>
      <span className='material-symbols-rounded p2 cursor-pointer !text-4xl'>
        menu
      </span>
    </button>
  )
}

export { ButtonMenu }
