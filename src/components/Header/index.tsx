import { MenuIcon } from '@heroicons/react/outline'
import cn from 'classnames'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Container, ProgressBar } from '../'
import { PAGE_DESCRIPTION } from '../../lib/constants'
import { Logo, LogoType } from '../Logo'
import { MainMenu } from './menu/Main'

const today: Date = new Date()

export enum HeaderType {
  Main = 'main',
  Category = 'category',
  Single = 'single',
  Share = 'share',
  Primary = 'primary',
}

type HeaderProps = {
  title?: string
  type?: 'main' | 'category' | 'single' | 'share' | 'primary'
  compact?: boolean
  isLoading?: boolean
  className?: string
  isMobile?: boolean
}

const defaultProps = {
  isMobile: false,
  compact: false,
  type: HeaderType.Main,
  title: PAGE_DESCRIPTION,
}

const Header = ({
  title,
  className,
  type,
  compact,
  isLoading,
}: HeaderProps) => {
  const isHeaderPrimary = type === HeaderType.Primary
  const isHeaderHome = type === HeaderType.Main
  const isHeaderShare = type === HeaderType.Share
  const isHeaderSingle = type === HeaderType.Single
  const isHeaderCategory = type === HeaderType.Category

  const headerClasses = cn(
    'flex transition-all ease-in delay-150 duration-300 text-white',
    { 'bg-primary': isHeaderPrimary },
    { 'bg-slate-200': isHeaderShare },
    { 'min-h-[60px] md:min-h-[90px]': !compact },
    { 'min-h-[60px] shadow-sm': compact },
    { 'border-b border-slate-200': !isHeaderSingle },
    { 'text-white': isHeaderPrimary },
    { 'text-zinc-400': !isHeaderPrimary },
    className
  )

  const logoMobile = {
    type: isHeaderPrimary ? LogoType.logonameb : LogoType.logoname,
    width: 140,
    height: 28,
  }

  const logoDesktop = {
    type: isHeaderPrimary ? LogoType.logocomb : LogoType.logocom,
    width: 220,
    height: 32,
  }

  return (
    <>
      <a href='#content' className='sr-only focus:not-sr-only'>
        Ir al contenido
      </a>
      <header className={headerClasses}>
        <Container className='flex items-center'>
          <div className='col'>
            <span className='md:hidden'>
              <Logo {...logoMobile} />
            </span>
            <span className='hidden md:block'>
              <Logo {...logoDesktop} />
            </span>
            <span className='sr-only'>{title}</span>
          </div>
          {isHeaderHome && (
            <div className='hidden pl-8 col sm:block'>
              <span className='py-2 pl-6 text-xs border-l-2 border-zinc-400'>
                Venezuela,
                <time>
                  {format(today, " dd 'de' MMMM 'de' yyyy", { locale: es })}
                </time>
              </span>
            </div>
          )}
          {isHeaderSingle && !isLoading && (
            <div className='hidden ml-8 col sm:block'>
              <p className='pl-6 mt-2 border-l-2 text-md md:text-xl border-zinc-400'>
                <a className='hover:text-primary ease duration-300' href='#'>
                  Costa Oriental
                </a>
              </p>
            </div>
          )}
          <div className='ml-auto col'>
            {isHeaderShare && !isLoading && '{Share Options}'}
            {!isHeaderShare && !isLoading && (
              <button
                aria-haspopup='true'
                aria-expanded='false'
                aria-label='menú de categorías y búsqueda'
                type='button'
                className={`flex items-center text-sm menu ease duration-300 text-slate-700 focus:shadow-outline pl-2 ${
                  isHeaderPrimary ? 'hover:text-white' : 'hover:text-primary'
                }`}
              >
                <span className='hidden pr-2 md:block'>Menú</span>
                <MenuIcon className='cursor-pointer w-7 h-7 p2' />
              </button>
            )}
          </div>
        </Container>
      </header>
      {isHeaderHome && isHeaderCategory && !isLoading && <MainMenu />}
      {isHeaderSingle && !isLoading && <ProgressBar percentage={70} />}
    </>
  )
}

Header.defaultProps = defaultProps

export { Header }
export type { HeaderProps }
