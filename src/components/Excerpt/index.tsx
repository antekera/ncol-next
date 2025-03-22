/* eslint-disable sonarjs/anchor-precedence */
import { cn } from '@lib/shared'

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

  return (
    <p className={classes}>
      {text.replace(/<p>|<\/p>|&nbsp;|\[&hellip;\]<\/p>$/gim, '')} ...
    </p>
  )
}

export { Excerpt }
