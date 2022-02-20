import { XIcon } from '@heroicons/react/outline'
import { format } from 'date-fns'
import Link from 'next/link'

import { usePageStore } from 'lib/hooks/store'

import { Icon } from '..'
import { Logo, LogoType } from '../Logo'

const today: Date = new Date()

type SideNavProps = {
  isOpen: boolean
}

const defaultProps = {
  isOpen: false,
}

const logoProps = {
  type: LogoType.logoname,
  width: 140,
  height: 28,
}

const SideNav = ({ isOpen }: SideNavProps) => {
  const { setPageSetupState } = usePageStore()

  const handleMenu = () => {
    setPageSetupState({
      isMenuActive: !isOpen,
    })
  }

  return (
    <nav>
      <div
        className={`fixed inset-0 z-10 transition-opacity duration-500 ease-out ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-50 pointer-events-none'
        }`}
      >
        <div
          className={`inset-0 bg-black opacity-70 ${isOpen ? 'absolute' : ''}`}
        ></div>
      </div>
      <aside
        className={`fixed top-0 right-0 z-30 h-full overflow-auto bg-white border-l-4 w-full sm:w-80 drop-shadow-md ease-in-out transition-all duration-300 border-primary ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='px-6'>
          <span className='flex items-center py-4 mb-2 border-b border-slate-300 box-border'>
            <Logo {...logoProps} />
            <button
              onClick={handleMenu}
              aria-label='cerrar menú de categorías y búsqueda'
              type='button'
              className='absolute right-4 top-4 focus:outline-none'
            >
              <XIcon className='cursor-pointer w-7 h-7 p4 text-slate-500 ease-out duration-500 hover:text-slate-800' />
            </button>
          </span>
        </div>
        <div className='px-8 content'>
          {[
            'Inicio',
            'Costa Oriental',
            'Maracaibo',
            'San Francisco',
            'Baralt',
            'Cabimas',
            'Ciudad Ojeda',
            'Lagunillas',
            'Miranda',
            'Santa Rita',
            'Simón Bolivar',
            'Valmore Rodriguez',
          ].map((name, index) => (
            <span key={index} className='block w-100'>
              <Link href={'@'}>
                <a className='block py-1 font-sans_light hover:underline text-slate-700'>
                  {name}
                </a>
              </Link>
            </span>
          ))}
        </div>
        <div className='px-8 py-3 mt-3 content bg-zinc-100'>
          {[
            'Actualidad',
            'Cultura',
            'Ciencia',
            'Cine',
            'Curiosidades',
            'Deportes',
            'Economía',
            'Educacion',
            'Entretenimiento',
            'Especiales',
            'Estilo de Vida',
            'Farándula',
            'Gastronomía',
            'Internacionales',
            'Internet',
            'Mundo',
            'Música',
            'Nacionales',
            'Opinión',
            'Política',
            'Salud',
            'Sucesos',
            'Tecnología',
            'Televisión',
          ].map((name, index) => (
            <span key={index} className='block w-100'>
              <Link href={'@'}>
                <a className='block py-1 font-sans_light hover:underline text-slate-700'>
                  {name}
                </a>
              </Link>
            </span>
          ))}
        </div>
        <div className='px-8 pt-6 pb-10 text-sm bg-darkBlue font-sans_light'>
          <div>
            {[
              'Contáctanos',
              'Publicidad',
              'Aviso de Privacidad',
              'Términos y Condiciones',
              'Aviso de Cookies',
            ].map((name, index) => (
              <span key={index} className='block w-100'>
                <Link href={'@'}>
                  <a className='block py-1 text-xs font-sans_light hover:underline text-slate-300'>
                    {name}
                  </a>
                </Link>
              </span>
            ))}
            <span className='block py-4 text-xs'>
              2012 - {format(today, 'yyyy')} &copy; Mas Multimedios C.A.
            </span>
            <hr className='border-slate-600' />
            <div className='flex pt-4'>
              <a
                href='#!'
                className='mr-6 hover:text-white ease-in-out duration-200'
              >
                <Icon network='facebook' width='w-4' />
              </a>
              <a
                href='#!'
                className='mr-6 hover:text-white ease-in-out duration-200'
              >
                <Icon network='twitter' width='w-4' />
              </a>
              <a
                href='#!'
                className='mr-6 hover:text-white ease-in-out duration-200'
              >
                <Icon network='instagram' width='w-4' />
              </a>
              <a
                href='#!'
                className='mr-6 hover:text-white ease-in-out duration-200'
              >
                <Icon network='linkedin' width='w-4' />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </nav>
  )
}

SideNav.defaultProps = defaultProps

export { SideNav }
export type { SideNavProps }
