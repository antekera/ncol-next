import { XIcon } from '@heroicons/react/outline'

import { Logo, LogoType } from '../Logo'

type CloseMenuButtonProps = {
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const logoProps = {
  type: LogoType.logoname,
  width: 140,
  height: 28,
}

const CloseMenuButton = ({ onClick }: CloseMenuButtonProps) => {
  return (
    <span className='flex items-center py-4 mb-2 border-b border-solid border-slate-300 box-border'>
      <Logo {...logoProps} />
      <button
        onClick={onClick}
        aria-label='cerrar menú de categorías y búsqueda'
        type='button'
        className='absolute border-none right-4 top-4 focus:outline-none'
      >
        <XIcon className='cursor-pointer w-7 h-7 p4 text-slate-500 ease-out duration-500 hover:text-slate-800' />
      </button>
    </span>
  )
}

export { CloseMenuButton }
