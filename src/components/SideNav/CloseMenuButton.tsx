'use client'

import { X } from 'lucide-react'
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
    <span className='mb-2 flex items-center pt-4 pb-3'>
      <Logo {...logoProps} location='menu' />
      <button
        onClick={onClick}
        aria-label='cerrar menú de categorías y búsqueda text-base'
        type='button'
        className='link-menu-button-close absolute top-4 right-4 cursor-pointer border-none text-slate-500 transition-colors duration-150 hover:text-slate-700 focus:outline-hidden dark:text-neutral-300'
      >
        <X size={30} />
      </button>
    </span>
  )
}

export { CloseMenuButton }
