import { Container } from '@components/Container'

type PageTitleProps = {
  text: string
}

const PageTitle = ({ text }: PageTitleProps) => {
  return (
    <div className='h-20 bg-primary md:h-24'>
      <Container className='text-left'>
        <h1 className='py-6 font-sans text-3xl text-zinc-100 md:py-8 md:text-4xl'>
          <span>{text}</span>
        </h1>
      </Container>
    </div>
  )
}

export { PageTitle }
