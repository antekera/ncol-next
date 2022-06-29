import { Container, ProgressBar, Share as ShareOptions } from '../'
import { Logo } from '../Logo'
import { logoDesktopOptions, logoMobileOptions } from './utils'

type HeaderShareProps = {
  title?: string
  scrolled: boolean
  isHeaderPrimary: boolean
}

const defaultProps = {
  scrolled: false,
  isHeaderPrimary: false,
}

const HeaderShare = ({
  scrolled,
  title,
  isHeaderPrimary,
}: HeaderShareProps) => {
  const logoMobile = logoMobileOptions(isHeaderPrimary)
  const logoDesktop = logoDesktopOptions(isHeaderPrimary)

  return (
    <header
      className={`bg-slate-200 top-0 left-0  min-h-[60px] shadow-sm fixed z-20 w-full pt-3 text-slate-500 transition-all ease-in-out duration-300 ${
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
        <div className='ml-auto col'>
          <ShareOptions />
        </div>
      </Container>
      <ProgressBar />
    </header>
  )
}

HeaderShare.defaultProps = defaultProps

export { HeaderShare }