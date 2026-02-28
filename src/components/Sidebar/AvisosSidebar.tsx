import React from 'react'
import Link from 'next/link'
import { Gavel } from 'lucide-react'
import { cn } from '@lib/shared'

interface AvisosSidebarProps {
  className?: string
}

export const AvisosSidebar: React.FC<AvisosSidebarProps> = ({ className }) => {
  return (
    <Link
      href='https://legales.noticiascol.com/'
      target='_blank'
      className='relative z-10 flex flex-col gap-1'
    >
      <div
        className={cn(
          'group relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 p-4 font-sans text-white shadow-lg transition-all duration-500 hover:shadow-blue-500/20 md:mb-4',
          className
        )}
      >
        <div className='absolute -right-6 -bottom-6 z-0 rotate-12 text-white opacity-20 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 group-hover:opacity-30'>
          <Gavel size={120} strokeWidth={1} />
        </div>

        <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

        <div className='flex items-center gap-3'>
          <h3 className='mt-1 text-sm font-extrabold tracking-tight uppercase'>
            Avisos Legales
          </h3>
          <div className='relative -left-1 flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 shadow-inner backdrop-blur-sm'>
            <Gavel size={20} className='text-white' />
          </div>
        </div>

        {/* <p className='text-xs leading-snug text-blue-50/90 lg:pr-8'>
                    Publica tus avisos legales con nosotros. La mejor vitrina para tu información juzgada.{' '}
                    <span className='translate-x-0 transition-transform duration-300 group-hover:translate-x-1'>
                        →
                    </span>
                </p> */}
      </div>
    </Link>
  )
}
