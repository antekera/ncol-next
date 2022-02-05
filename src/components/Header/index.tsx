import { MenuIcon } from '@heroicons/react/outline'
import classNames from 'classnames'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Container, ProgressBar } from '../'
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
  type?: HeaderType
  compact?: boolean
  className?: string
  isMobile?: boolean
}

const defaultProps = {
  isMobile: false,
  compact: false,
  type: HeaderType.Main,
  title:
    'Noticias de la Col, Cabimas, Maracaibo, Ciudad Ojeda, Lagunillas al dia y las 24 horas',
}

const Header = ({ title, className, type, compact }: HeaderProps) => {
  const isHeaderPrimary = type === HeaderType.Primary
  const isHeaderHome = type === HeaderType.Main
  const isHeaderShare = type === HeaderType.Share
  const isHeaderSingle = type === HeaderType.Single
  const isHeaderCategory = type === HeaderType.Category

  const headerClasses = classNames(
    'flex transition-all ease-in delay-150 duration-300 text-white',
    { 'bg-primary': isHeaderPrimary },
    { 'bg-lightGray': isHeaderShare },
    { 'min-h-[60px] md:min-h-[90px]': !compact },
    { 'min-h-[60px] shadow-sm': compact },
    { 'border-b border-lightGray': !isHeaderSingle },
    { 'text-white': isHeaderPrimary },
    { 'text-gray': !isHeaderPrimary },
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
              <span className='py-2 pl-6 text-xs border-l-2 border-border-lightGray'>
                Venezuela,
                <time>
                  {format(today, " dd 'de' MMMM 'de' yyyy", { locale: es })}
                </time>
              </span>
            </div>
          )}
          {isHeaderSingle && (
            <div className='hidden ml-8 col sm:block'>
              <p className='pl-6 mt-2 border-l-2 text-md md:text-lg border-border-lightGray'>
                <a className='hover:text-primary ease duration-300' href='#'>
                  Costa Oriental
                </a>
              </p>
            </div>
          )}
          <div className='ml-auto col'>
            {isHeaderShare ? (
              '{Share Options}'
            ) : (
              <button
                aria-haspopup='true'
                aria-expanded='false'
                aria-label='menú de categorías y búsqueda'
                type='button'
                className={`flex items-center text-sm menu ease duration-300 text-darkGray focus:shadow-outline pl-2 ${
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
      {isHeaderHome && isHeaderCategory && <MainMenu />}
      {isHeaderSingle && <ProgressBar percentage={70} />}
    </>
  )
}

Header.defaultProps = defaultProps

export { Header }
export type { HeaderProps }
