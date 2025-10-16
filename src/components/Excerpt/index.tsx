import { cleanExcerpt } from '@lib/utils/cleanExcerpt'
import { cn } from '@lib/shared'
import './excerpt.css'

type ExcerptProps = {
  text?: string
  className?: string
}

const Excerpt = ({ text, className }: ExcerptProps) => {
  if (!text) {
    return null
  }

  return <p className={cn('excerpt', className)}>{cleanExcerpt(text)} ...</p>
}

export { Excerpt }