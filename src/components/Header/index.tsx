import { MenuIcon } from '@heroicons/react/outline'
import cn from 'classnames'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { PAGE_DESCRIPTION, HEADER_TYPE } from 'lib/constants'
import { useScrollHandler } from 'lib/hooks/useScrollHandler'
import { usePageState } from 'lib/stores/pageStore'

import { Container, ProgressBar, SideNav, Share as ShareOptions } from '../'
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
  compact?: boolean
  className?: string
  isMobile?: boolean
}

const defaultProps = {
  isMobile: false,
  compact: false,
  title: PAGE_DESCRIPTION,
}

const Header = ({ title, className }: HeaderProps) => {
  const pageState = usePageState()
  const isLoading = pageState.isLoading.get()
  const type = pageState.headerType.get()

  const isHeaderPrimary = type === HEADER_TYPE.PRIMARY
  const isHeaderHome = type === HEADER_TYPE.MAIN
  const isHeaderShare = type === HEADER_TYPE.SHARE
  const isHeaderSingle = type === HEADER_TYPE.SINGLE
  const isHeaderCategory = type === HEADER_TYPE.CATEGORY

  const scrolled = useScrollHandler(90)

  const headerClasses = cn(
    'transition-all ease-in duration-300 text-white',
    { 'bg-primary': isHeaderPrimary },
    { 'border-b border-slate-200': !isHeaderSingle },
    { 'text-white': isHeaderPrimary },
    { 'text-zinc-400': !isHeaderPrimary },
    { 'min-h-[60px] md:min-h-[90px] flex relative': !isHeaderShare },
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

  const HeaderShare = () => {
    return (
      <header
        className={`bg-slate-200 min-h-[60px] shadow-sm fixed z-20 top-0 w-full pt-3 text-slate-500 transition ease-in-out duration-300 ${
          scrolled ? 'translate-y-0' : '-translate-y-16'
        }`}
      >
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
          <div className='ml-auto col'>
            <ShareOptions />
          </div>
        </Container>
        <ProgressBar percentage={70} />
      </header>
    )
  }

  return (
    <>
      <a href='#content' className='sr-only focus:not-sr-only'>
        Ir al contenido
      </a>
      <header className={headerClasses}>
        <SideNav />
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
            {!isLoading && (
              <button
                aria-haspopup='true'
                aria-expanded='false'
                aria-label='menú de categorías y búsqueda'
                title='menú de categorías y búsqueda'
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
        {isHeaderSingle && !isLoading && <ProgressBar percentage={70} />}
      </header>
      {isHeaderHome && isHeaderCategory && !isLoading && <MainMenu />}
      {isHeaderSingle && <HeaderShare />}
    </>
  )
}

Header.defaultProps = defaultProps

export { Header }
export type { HeaderProps }
