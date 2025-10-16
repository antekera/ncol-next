import { Container } from '@components/Container'
import { cn } from '@lib/shared'
import './page-title.css'

type PageTitleProps = {
  text: string
  className?: string
}

const PageTitle = ({ text, className }: PageTitleProps) => {
  return (
    <div className={cn('page-title', className)}>
      <Container className='text-left'>
        <h1 className='page-title-heading'>
          <span>{text}</span>
        </h1>
      </Container>
    </div>
  )
}

export { PageTitle }