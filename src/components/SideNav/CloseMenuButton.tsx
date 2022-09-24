import { Logo, LogoType } from '../Logo'

type CloseMenuButtonProps = {
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const logoProps = {
  type: LogoType.logoname,
  width: 140,
  height: 28
}

const CloseMenuButton = ({ onClick }: CloseMenuButtonProps) => {
  return (
    <span className='flex items-center py-4 mb-2 border-b border-solid border-slate-300 box-border'>
      <Logo {...logoProps} />
      <button
        onClick={onClick}
        aria-label='cerrar menú de categorías y búsqueda'
        type='button'
        className='absolute border-none link-menu-button-close right-4 top-4 focus:outline-none'
      >
        <span className='cursor-pointer !text-3xl material-symbols-rounded p4 text-slate-500 ease-out duration-500 hover:text-slate-800'>
          close
        </span>
      </button>
    </span>
  )
}

export { CloseMenuButton }
