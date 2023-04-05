import cn from 'classnames'

type ExcerptProps = {
  text?: string
  className?: string
}

const Excerpt = ({ text, className }: ExcerptProps) => {
  const classes = cn(
    'text-sm sm:text-md lg:text-base text-slate-500',
    className
  )

  if (!text) {
    return null
  }

  return (
    <p className={classes}>
      {text.replace(/&nbsp; |<p>|<p>&nbsp; |(&#8230)[\s\S]*$/gim, '')} ...
    </p>
  );
}

export { Excerpt }
export type { ExcerptProps }
