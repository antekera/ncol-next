import { cleanExcerpt } from '@lib/utils/cleanExcerpt'
import { getExcerptClasses } from './styles'

type ExcerptProps = {
  text?: string
  className?: string
}

const Excerpt = ({ text, className }: ExcerptProps) => {
  const classes = getExcerptClasses(className)

  if (!text) {
    return null
  }

  return <p className={classes}>{cleanExcerpt(text)} ...</p>
}

export { Excerpt }
