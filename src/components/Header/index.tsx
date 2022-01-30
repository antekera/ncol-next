import { MenuIcon } from '@heroicons/react/outline'
import classNames from 'classnames'

import { Container, ProgressBar } from '../'
import { Logo, LogoType } from '../Logo'

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
    'Noticiascol.com, El Diario Digital de La Costa Oriental del Lago, Zulia y Venezuela',
}

const Header = ({ title, className, type, compact }: HeaderProps) => {
  const isHeaderPrimary = type === HeaderType.Primary
  const isHeaderShare = type === HeaderType.Share
  const isHeaderSingle = type === HeaderType.Single

  const headerClasses = classNames(
    'flex transition-all ease-in delay-150 duration-300',
    { 'bg-primary': isHeaderPrimary },
    { 'bg-lightGray': isHeaderShare },
    { 'min-h-[60px] md:min-h-[90px]': !compact },
    { 'min-h-[60px] shadow-sm': compact },
    { 'border-b border-lightGray': !isHeaderSingle },
    className
  )

  const menuClasses = classNames(
    'flex items-center text-sm menu text-gray hover:text-darkGray ease-in',
    { 'text-white': isHeaderPrimary },
    { 'text-baseGray': type !== HeaderType.Primary }
  )

  const logoMobile = {
    type: isHeaderPrimary ? LogoType.logonameb : LogoType.logoname,
    width: 140,
    height: 28,
  }

  const logoDesktop = {
    type: isHeaderPrimary ? LogoType.logocomb : LogoType.logocom,
    width: 205,
    height: 28,
  }

  return (
    <>
      <a href='#content' className='sr-only focus:not-sr-only'>
        Ir al contenido
      </a>
      <header className={headerClasses}>
        <Container className='flex items-center justify-between'>
          <div className='col'>
            <span className='md:hidden'>
              <Logo {...logoMobile} />
            </span>
            <span className='hidden md:block'>
              <Logo {...logoDesktop} />
            </span>
            <span className='sr-only'>{title}</span>
          </div>
          <div className='col'>
            {isHeaderShare ? (
              '{Share Options}'
            ) : (
              <button
                aria-haspopup='true'
                aria-expanded='false'
                aria-label='menú de categorías y búsqueda'
                type='button'
                className={menuClasses}
              >
                <span className='hidden pr-2 md:block'>Menú</span>
                <MenuIcon className='cursor-pointer w-7 h-7 p2' />
              </button>
            )}
          </div>
        </Container>
      </header>
      {isHeaderSingle && <ProgressBar percentage={70} />}
    </>
  )
}

Header.defaultProps = defaultProps

export { Header }
export type { HeaderProps }
