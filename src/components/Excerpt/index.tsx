import { cn } from '@lib/shared'

type ExcerptProps = {
  text?: string
  className?: string
}

const Excerpt = ({ text, className }: ExcerptProps) => {
  const classes = cn(
    'sm:text-md text-sm text-slate-500 lg:text-base',
    className
  )

  if (!text) {
    return null
  }

  return (
    <p className={classes}>
      {text.replace(/&nbsp; |<p>|<p>&nbsp; |(&#8230)[\s\S]*$/gim, '')} ...
    </p>
  )
}

export { Excerpt }
