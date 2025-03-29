import { Container } from '@components/Container'
import { cn } from '@lib/shared'

type PageTitleProps = {
  text: string
  className?: string
}

const PageTitle = ({ text, className }: PageTitleProps) => {
  const classes = cn('bg-primary h-20 md:h-24 dark:bg-neutral-800', className)
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
