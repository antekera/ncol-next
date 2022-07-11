import { Container, ProgressBar, Share as ShareOptions } from '../'
import { Logo } from '../Logo'
import { logoDesktopOptions, logoMobileOptions } from './utils'

type HeaderShareProps = {
  title?: string
  scrolled: boolean
  isHeaderPrimary: boolean
  contentHeight?: number
}

const defaultProps = {
  scrolled: false,
  isHeaderPrimary: false,
}

const HeaderShare = ({
  scrolled,
  title,
  isHeaderPrimary,
  contentHeight,
}: HeaderShareProps) => {
  const logoMobile = logoMobileOptions(isHeaderPrimary)
  const logoDesktop = logoDesktopOptions(isHeaderPrimary)

  return (
    <header
      className={`bg-zinc-100 z-40 top-0 left-0 min-h-[55px] md:min-h-[60px] shadow-sm fixed w-full pt-3 text-slate-500 transition-all ease-in-out duration-300 ${
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
        <div className='ml-auto col whitespace-nowrap'>
          <ShareOptions />
        </div>
      </Container>
      <ProgressBar contentHeight={contentHeight} />
    </header>
  )
}

HeaderShare.defaultProps = defaultProps

export { HeaderShare }
