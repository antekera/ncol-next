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
      {/* eslint-disable-next-line sonarjs/anchor-precedence */}
      {text.replace(/&nbsp; |<p>|<p>&nbsp; |(&#8230)[\s\S]*$/gim, '')} ...
    </p>
  )
}

export { Excerpt }
