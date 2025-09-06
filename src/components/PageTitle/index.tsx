import { Container } from '@components/Container'
import { getPageTitleClasses } from './styles'

type PageTitleProps = {
  text: string
  className?: string
}

const PageTitle = ({ text, className }: PageTitleProps) => {
  const classes = getPageTitleClasses(className)
  return (
    <div className={classes}>
      <Container className='text-left'>
        <h1 className='py-6 font-sans text-3xl text-zinc-100 md:py-8 md:text-4xl'>
          <span>{text}</span>
        </h1>
      </Container>
    </div>
  )
}

export { PageTitle }
