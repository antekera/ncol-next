'use client'

import Link from 'next/link'
import { Container } from '@components/Container'
import { DateTime } from '@components/DateTime'
import { ButtonMenu } from '@components/Header/ButtonMenu'
import { HeaderShare } from '@components/Header/HeaderShare'
import { MainMenu } from '@components/Header/menu/Main'
import { Logo } from '@components/Logo'
import { ProgressBar } from '@components/ProgressBar'
import { SideNav } from '@components/SideNav'
import { ModeToggle } from '@components/ThemeSwitch'
import { CATEGORY_PATH, PAGE_DESCRIPTION } from '@lib/constants'
import { useScrollHandler } from '@lib/hooks/useScrollHandler'
import { cn } from '@lib/shared'
import { Categories } from '@lib/types'
import { GAEvent, getCategoryNode } from '@lib/utils'
import { logoDesktopOptions, logoMobileOptions } from './utils'

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
  const isHeaderPrimary = headerType === HeaderType.Primary
  const isHeaderHome = headerType === HeaderType.Main
  const isHeaderShare = headerType === HeaderType.Share
  const isHeaderSingle = headerType === HeaderType.Single

  const scrolled = useScrollHandler(defaultScrolledHeight)
  const category = getCategoryNode(categories)

  const headerClasses = cn(
    'text-white transition-all duration-300 ease-in',
    { 'bg-primary md:min-h-[60px]': isHeaderPrimary },
    { 'border-b border-slate-200 dark:border-neutral-500': !isHeaderSingle },
    { 'border-dark-blue/20 text-white': isHeaderPrimary },
    { 'text-zinc-400': !isHeaderPrimary },
    {
      'relative flex min-h-[60px] md:min-h-[90px] dark:bg-neutral-800':
        !isHeaderShare
    },
    className
  )

  const logoMobile = logoMobileOptions(isHeaderPrimary)
  const logoDesktop = logoDesktopOptions(isHeaderPrimary)

  return (
    <>
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
            {title && <span className='sr-only'>{title}</span>}
          </div>
          {isHeaderHome && (
            <div className='col hidden pl-4 sm:block md:pl-8'>
              <span className='border-l-2 border-zinc-400 pl-3 font-sans text-xs sm:py-2 md:pl-6'>
                <DateTime formal />
              </span>
            </div>
          )}
          {isHeaderSingle && category && (
            <div className='col ml-8 hidden sm:block'>
              <p className='text-basemt-2 border-l-2 border-zinc-400 pl-6 md:text-xl'>
                <Link
                  href={`${CATEGORY_PATH}/${category.slug}/`}
                  className='link-cat-header link-category-header hover:text-primary hover:dark:text-secondary font-sans'
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
          <div className='ml-auto flex gap-4'>
            <ModeToggle isHeaderPrimary={isHeaderPrimary} />
            <ButtonMenu isHeaderPrimary={isHeaderPrimary} />
          </div>
        </Container>
        {isHeaderSingle && <ProgressBar />}
      </header>
      {isHeaderHome && <MainMenu />}
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
