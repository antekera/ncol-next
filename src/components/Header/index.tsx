'use client'

import { Container } from '@components/Container'
import { DateTime } from '@components/DateTime'
import { ButtonMenu } from '@components/Header/ButtonMenu'
import { HeaderShare } from '@components/Header/HeaderShare'
import { MainMenu } from '@components/Header/menu/Main'
import { Logo } from '@components/Logo'
import { ProgressBar } from '@components/ProgressBar'
import { SideNav } from '@components/SideNav'
import { ModeToggle } from '@components/ThemeSwitch'
import { SearchToggle } from '@components/SearchToggle'
import { PAGE_DESCRIPTION } from '@lib/constants'
import { useScrollHandler } from '@lib/hooks/useScrollHandler'
import { logoDesktopOptions, logoMobileOptions } from './utils'
import { getHeaderClasses } from './styles'

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
  uri?: string
}

const Header = ({
  title = PAGE_DESCRIPTION,
  className,
  headerType = 'main',
  uri
}: HeaderProps) => {
  const ht = headerType as HeaderType
  const isHeaderPrimary = ht === HeaderType.Primary
  const isHeaderHome = ht === HeaderType.Main
  const isHeaderSingle = ht === HeaderType.Single

  const scrolled = useScrollHandler(defaultScrolledHeight)

  const headerClasses = getHeaderClasses({ headerType, className, scrolled })

  const logoMobile = logoMobileOptions(isHeaderPrimary)
  const logoDesktop = logoDesktopOptions(isHeaderPrimary)

  return (
    <>
      <header className={headerClasses}>
        <SideNav />
        <Container className='flex items-center'>
          <div className='col'>
            <span className='md:hidden'>
              <Logo {...logoMobile} location='header' />
            </span>
            <span className='hidden md:block'>
              <Logo {...logoDesktop} location='header' />
            </span>
            {title && <span className='sr-only'>{title}</span>}
          </div>
          {isHeaderHome && (
            <div className='col hidden pt-2 pl-4 sm:block md:pl-8'>
              <span className='border-l-2 border-neutral-300 pl-3 font-sans text-xs text-neutral-600 sm:py-2 md:pl-6 dark:border-neutral-500 dark:text-neutral-400'>
                <DateTime formal />
              </span>
            </div>
          )}
          <div className='ml-auto flex gap-2'>
            <SearchToggle isHeaderPrimary={isHeaderPrimary} />
            <ModeToggle isHeaderPrimary={isHeaderPrimary} />
            <ButtonMenu isHeaderPrimary={isHeaderPrimary} />
          </div>
        </Container>
        {isHeaderSingle && <ProgressBar />}
      </header>
      {isHeaderHome && <MainMenu />}
      {isHeaderSingle && (
        <HeaderShare
          uri={uri ?? ''}
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
