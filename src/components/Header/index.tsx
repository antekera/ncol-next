import { useEffect } from 'react'

import cn from 'classnames'

import { PAGE_DESCRIPTION, HEADER_TYPE, CATEGORY_PATH } from 'lib/constants'
import { usePageStore } from 'lib/hooks/store'
import { useScrollHandler } from 'lib/hooks/useScrollHandler'

import { Container, ProgressBar, SideNav, DateTime } from '../'
import { Logo } from '../Logo'
import { ButtonMenu } from './ButtonMenu'
import { HeaderShare } from './HeaderShare'
import { MainMenu } from './menu/Main'
import { logoMobileOptions, logoDesktopOptions } from './utils'

const defaultScrolledHeight = 90
const CITY = ' Cabimas - Venezuela,'

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
  headerType: string
}

const defaultProps = {
  isMobile: false,
  compact: false,
  title: PAGE_DESCRIPTION,
}

const Header = ({ title, className, headerType }: HeaderProps) => {
  const { setPageSetupState } = usePageStore()

  const isLoading = usePageStore(state => state.isLoading)
  const isMenuActive = usePageStore(state => state.isMenuActive)
  const currentCategory = usePageStore(state => state.currentCategory)

  const isHeaderPrimary = headerType === HEADER_TYPE.PRIMARY
  const isHeaderHome = headerType === HEADER_TYPE.MAIN
  const isHeaderShare = headerType === HEADER_TYPE.SHARE
  const isHeaderSingle = headerType === HEADER_TYPE.SINGLE
  const isHeaderCategory = headerType === HEADER_TYPE.CATEGORY

  const scrolled = useScrollHandler(defaultScrolledHeight)

  const headerClasses = cn(
    'transition-all ease-in duration-300 text-white',
    { 'bg-primary': isHeaderPrimary },
    { 'border-b border-slate-200': !isHeaderSingle },
    { 'text-white': isHeaderPrimary },
    { 'text-zinc-400': !isHeaderPrimary },
    { 'min-h-[60px] md:min-h-[90px] flex relative': !isHeaderShare },
    className
  )

  const logoMobile = logoMobileOptions(isHeaderPrimary)
  const logoDesktop = logoDesktopOptions(isHeaderPrimary)

  const handleMenu = () => {
    setPageSetupState({
      isMenuActive: !isMenuActive,
    })
  }

  useEffect(() => {
    const body = document.querySelector('body')
    if (isMenuActive || isLoading) {
      body?.classList.add('active-menu')
    } else {
      body?.classList.remove('active-menu')
    }
  }, [isMenuActive, isLoading])

  return (
    <>
      <a href='#content' className='sr-only focus:not-sr-only'>
        Ir al contenido
      </a>
      <header className={headerClasses}>
        <SideNav isOpen={isMenuActive} />
        <Container className='flex items-center'>
          <div className='col'>
            <span className='md:hidden'>
              <Logo {...logoMobile} />
            </span>
            <span className='hidden md:block'>
              <Logo {...logoDesktop} />
            </span>
            {title && <span className='sr-only'>{title}</span>}
          </div>
          {isHeaderHome && (
            <div className='hidden pl-4 md:pl-8 col sm:block'>
              <span className='pl-3 text-xs border-l-2 md:pl-6 sm:py-2 border-zinc-400'>
                {CITY}
                <DateTime />
              </span>
            </div>
          )}
          {currentCategory && isHeaderSingle && !isLoading && (
            <div className='hidden ml-8 col sm:block'>
              <p className='pl-6 mt-2 border-l-2 text-md md:text-xl border-zinc-400'>
                <a
                  className='hover:text-primary ease duration-300'
                  href={`${CATEGORY_PATH}/${currentCategory.slug}/`}
                >
                  {currentCategory.name}
                </a>
              </p>
            </div>
          )}
          <div className='ml-auto col'>
            <ButtonMenu
              isHeaderPrimary={isHeaderPrimary}
              handleMenu={handleMenu}
              isMenuActive={isMenuActive}
            />
          </div>
        </Container>
        {isHeaderSingle && <ProgressBar />}
      </header>
      {(isHeaderHome || isHeaderCategory) && !isLoading && <MainMenu />}
      {isHeaderSingle && (
        <HeaderShare
          scrolled={scrolled}
          title={title}
          isHeaderPrimary={isHeaderPrimary}
        />
      )}
    </>
  )
}

Header.defaultProps = defaultProps

export { Header }
export type { HeaderProps }
