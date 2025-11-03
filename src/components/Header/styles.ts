import { cn } from '@lib/shared'
import { HeaderType } from '.'

type HeaderClassesProps = {
  headerType?: string
  className?: string
  scrolled?: boolean
}

export const getHeaderClasses = ({
  headerType,
  className,
  scrolled
}: HeaderClassesProps) => {
  const isHeaderPrimary = headerType === HeaderType.Primary
  const isHeaderSingle = headerType === HeaderType.Single
  const isHeaderShare = headerType === HeaderType.Share

  let positionClass: string | undefined
  if (!isHeaderShare) {
    positionClass = isHeaderSingle ? 'sticky top-0 z-40' : 'relative'
  }

  let mdMinHeightClass: string | undefined
  if (!isHeaderShare) {
    mdMinHeightClass =
      isHeaderSingle && scrolled ? 'md:min-h-[60px]' : 'md:min-h-[90px]'
  }

  return cn(
    'bg-white text-white transition-all duration-300 ease-in-out motion-reduce:transition-none md:duration-500',
    { 'bg-primary md:min-h-[60px]': isHeaderPrimary },
    { 'border-b border-slate-200 dark:border-neutral-500': !isHeaderSingle },
    { 'border-dark-blue/20 text-white': isHeaderPrimary },
    {
      'border-b border-slate-200 text-zinc-400 dark:border-neutral-500':
        !isHeaderPrimary
    },
    !isHeaderShare && 'flex min-h-[56px] dark:bg-neutral-800',
    positionClass,
    mdMinHeightClass,
    className
  )
}

type ThemeSwitchClassesProps = {
  isHeaderPrimary?: boolean
}

export const getThemeSwitchClassName = ({
  isHeaderPrimary
}: ThemeSwitchClassesProps) =>
  cn(
    'focus:shadow-outline flex cursor-pointer items-center justify-center rounded-md bg-transparent text-center transition-colors',
    'h-10 w-10 hover:bg-gray-100 hover:text-slate-900',
    'dark:hover:bg-primary dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:text-white',
    isHeaderPrimary ? 'text-white' : 'text-slate-700'
  )
