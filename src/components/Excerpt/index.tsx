import { cn } from '@lib/shared'
import { cleanExcerpt } from '@lib/utils/cleanExcerpt'

type ExcerptProps = {
  text?: string
  className?: string
}

const Excerpt = ({ text, className }: ExcerptProps) => {
  const classes = cn(
    'text-sm text-slate-500 sm:text-base lg:text-base',
    className
  )

  if (!text) {
    return null
  }

  return <p className={classes}>{cleanExcerpt(text)} ...</p>
}

export { Excerpt }
