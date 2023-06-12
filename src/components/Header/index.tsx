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
    'transition-all ease-in duration-300 text-white',
    { 'bg-primary md:min-h-[60px]': isHeaderPrimary },
    { 'border-b border-slate-200': !isHeaderSingle },
    { 'text-white border-darkBlue/20': isHeaderPrimary },
    { 'text-zinc-400': !isHeaderPrimary },
    { 'min-h-[60px] md:min-h-[90px] flex relative': !isHeaderShare },
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
            <div className='hidden pl-4 md:pl-8 col sm:block'>
              <span className='pl-3 text-xs border-l-2 md:pl-6 sm:py-2 border-zinc-400'>
                {/*{CITY}*/}
                <DateTime formal />
              </span>
            </div>
          )}
          {isHeaderSingle && !isLoading && category && (
            <div className='hidden ml-8 col sm:block'>
              <p className='pl-6 mt-2 border-l-2 text-md md:text-xl border-zinc-400'>
                <Link
                  href={`${CATEGORY_PATH}/${category.slug}/`}
                  className='link-cat-header hover:text-primary link-category-header'
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
