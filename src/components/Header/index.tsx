import { useEffect } from 'react'

import cn from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Container } from '@components/Container'
import { DateTime } from '@components/DateTime'
import { ButtonMenu } from '@components/Header/ButtonMenu'
import { HeaderShare } from '@components/Header/HeaderShare'
import { MainMenu } from '@components/Header/menu/Main'
import { Logo } from '@components/Logo'
import { ProgressBar } from '@components/ProgressBar'
import { SideNav } from '@components/SideNav'
import { PAGE_DESCRIPTION, CATEGORY_PATH } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { useScrollHandler } from '@lib/hooks/useScrollHandler'
import { Categories } from '@lib/types'
import { GAEvent, getCategoryNode } from '@lib/utils'

import { logoMobileOptions, logoDesktopOptions } from './utils'

const defaultScrolledHeight = 90

export enum HeaderType {
  Main = 'main',
  Category = 'category',
  Single = 'single',
  Share = 'share',
  Primary = 'primary'
}

type HeaderProps = {
  title?: string
  className?: string
  headerType?: string
  categories?: Categories
}

const Header = ({
  title = PAGE_DESCRIPTION,
  className,
  headerType = 'main',
  categories
}: HeaderProps) => {
  const { setPageSetupState } = usePageStore()

  const isMenuActive = usePageStore(state => state.isMenuActive)

  const router = useRouter()
  const isLoading = router.isFallback

  const isHeaderPrimary = headerType === HeaderType.Primary
  const isHeaderHome = headerType === HeaderType.Main
  const isHeaderShare = headerType === HeaderType.Share
  const isHeaderSingle = headerType === HeaderType.Single

  const scrolled = useScrollHandler(defaultScrolledHeight)
  const category = getCategoryNode(categories)

  const headerClasses = cn(
    'text-white transition-all duration-300 ease-in',
    { 'bg-primary md:min-h-[60px]': isHeaderPrimary },
    { 'border-b border-slate-200': !isHeaderSingle },
    { 'border-darkBlue/20 text-white': isHeaderPrimary },
    { 'text-zinc-400': !isHeaderPrimary },
    { 'relative flex min-h-[60px] md:min-h-[90px]': !isHeaderShare },
    className
  )

  const logoMobile = logoMobileOptions(isHeaderPrimary)
  const logoDesktop = logoDesktopOptions(isHeaderPrimary)

  const handleMenu = () => {
    GAEvent({
      category: 'MENU',
      label: 'OPEN_MENU'
    })
    setPageSetupState({
      isMenuActive: !isMenuActive
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
            <div className='col hidden pl-4 sm:block md:pl-8'>
              <span className='border-l-2 border-zinc-400 pl-3 font-sans text-xs sm:py-2 md:pl-6'>
                {/*{CITY}*/}
                <DateTime formal />
              </span>
            </div>
          )}
          {isHeaderSingle && !isLoading && category && (
            <div className='col ml-8 hidden sm:block'>
              <p className='text-md mt-2 border-l-2 border-zinc-400 pl-6 md:text-xl'>
                <Link
                  href={`${CATEGORY_PATH}/${category.slug}/`}
                  className='link-cat-header link-category-header font-sans hover:text-primary'
                  onClick={() =>
                    GAEvent({
                      category: 'CATEGORY_HEADER',
                      label: `HEADER_${category.slug?.toUpperCase()}`
                    })
                  }
                >
                  {category.name}
                </Link>
              </p>
            </div>
          )}
          <div className='col ml-auto'>
            <ButtonMenu
              isHeaderPrimary={isHeaderPrimary}
              handleMenu={handleMenu}
              isMenuActive={isMenuActive}
            />
          </div>
        </Container>
        {isHeaderSingle && <ProgressBar />}
      </header>
      {isHeaderHome && !isLoading && <MainMenu />}
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

export { Header }
export type { HeaderProps }
