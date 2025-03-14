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
    <span className='mb-2 box-border flex items-center border-b border-solid border-slate-300 py-4'>
      <Logo {...logoProps} />
      <button
        onClick={onClick}
        aria-label='cerrar menú de categorías y búsqueda'
        type='button'
        className='link-menu-button-close absolute top-4 right-4 border-none focus:outline-hidden'
      >
        <X size={30} />
      </button>
    </span>
  )
}

export { CloseMenuButton }
