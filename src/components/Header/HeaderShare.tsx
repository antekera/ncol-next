import { Container } from '@components/Container'
import { Logo } from '@components/Logo'
import { ProgressBar } from '@components/ProgressBar'
import { Share as ShareOptions } from '@components/Share'
import { logoDesktopOptions, logoMobileOptions } from './utils'

type HeaderShareProps = {
  title?: string
  scrolled?: boolean
  isHeaderPrimary?: boolean
}

const HeaderShare = ({
  scrolled = false,
  title,
  isHeaderPrimary = false
}: HeaderShareProps) => {
  const logoMobile = logoMobileOptions(isHeaderPrimary)
  const logoDesktop = logoDesktopOptions(isHeaderPrimary)

  return (
    <header
      className={`fixed top-0 left-0 z-40 min-h-[55px] w-full bg-zinc-100 pt-3 text-slate-500 shadow-sm transition-all duration-300 ease-in-out md:min-h-[60px] dark:bg-neutral-800 dark:text-neutral-300 ${
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
          {title && <span className='sr-only'>{title}</span>}
        </div>
        <div className='col ml-auto whitespace-nowrap'>
          <ShareOptions />
        </div>
      </Container>
      <ProgressBar />
    </header>
  )
}

export { HeaderShare }
