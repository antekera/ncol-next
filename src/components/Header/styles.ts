import { cn } from '@lib/shared'
import { HeaderType } from '.'

type HeaderClassesProps = {
  headerType?: string
  className?: string
}

export const getHeaderClasses = ({
  headerType,
  className
}: HeaderClassesProps) => {
  const isHeaderPrimary = headerType === HeaderType.Primary
  const isHeaderSingle = headerType === HeaderType.Single
  const isHeaderShare = headerType === HeaderType.Share

  return cn(
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
}
