'use client'

import { Container } from '@components/Container'
import { Logo } from '@components/Logo'
import { ProgressBar } from '@components/ProgressBar'
import { Share as ShareOptions } from '@components/Share'
import ContextStateData from '@lib/context/StateContext'
import { logoDesktopOptions, logoMobileOptions } from './utils'

type HeaderShareProps = {
  title?: string
  scrolled?: boolean
  isHeaderPrimary?: boolean
  uri: string
}

const HeaderShare = ({
  scrolled = false,
  title,
  isHeaderPrimary = false,
  uri
}: HeaderShareProps) => {
  const { headerShareUri } = ContextStateData()
  const logoMobile = logoMobileOptions(isHeaderPrimary)
  const logoDesktop = logoDesktopOptions(isHeaderPrimary)
  const effectiveUri = headerShareUri || uri

  return (
    <header
      className={`fixed top-0 left-0 z-40 min-h-[55px] w-full transform-gpu bg-zinc-100 pt-3 text-slate-500 shadow-sm transition-all duration-300 ease-in-out motion-reduce:transition-none md:min-h-[60px] md:duration-500 dark:bg-neutral-800 dark:text-neutral-300 ${
        scrolled ? 'translate-y-0' : '-translate-y-16'
      }`}
    >
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
        <div className='col ml-auto whitespace-nowrap'>
          <ShareOptions uri={effectiveUri} />
        </div>
      </Container>
      <ProgressBar />
    </header>
  )
}

export { HeaderShare }
