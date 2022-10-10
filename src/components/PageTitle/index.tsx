import { Container } from '@components/Container'

type PageTitleProps = {
  text: string
}

const PageTitle = ({ text }: PageTitleProps): JSX.Element => {
  return (
    <div className='bg-primary'>
      <Container className='text-left'>
        <h1 className='py-6 font-sans text-3xl md:py-8 md:text-4xl text-zinc-100'>
          <span>{text}</span>
        </h1>
      </Container>
    </div>
  )
}

export { PageTitle }
