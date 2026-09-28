import React from 'react'
import Link from 'next/link'
import { Tags } from 'lucide-react'
import { cn } from '@lib/shared'

interface ClasificadosSidebarProps {
  className?: string
}

export const ClasificadosSidebar: React.FC<ClasificadosSidebarProps> = ({
  className
}) => {
  return (
    <Link
      href='https://clasificados.noticiascol.com/'
      target='_blank'
      rel='noopener noreferrer'
      aria-label='Clasificados'
      className='relative z-10 flex flex-col gap-1'
    >
      <div
        className={cn(
          'group relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-800 p-4 font-sans text-white shadow-lg transition-all duration-500 hover:shadow-yellow-500/20 md:mb-4',
          className
        )}
      >
        <div className='absolute -right-6 -bottom-6 z-0 rotate-12 text-white opacity-20 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 group-hover:opacity-30'>
          <Tags size={120} strokeWidth={1} />
        </div>

        <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

        <div className='flex items-center gap-3'>
          <h3 className='mt-1 text-sm font-extrabold tracking-tight uppercase'>
            Clasificados
          </h3>
          <div className='relative -left-1 flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 shadow-inner backdrop-blur-sm'>
            <Tags size={20} className='text-white' />
          </div>
        </div>
      </div>
    </Link>
  )
}
