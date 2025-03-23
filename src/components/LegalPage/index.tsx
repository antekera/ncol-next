import { NextPage } from 'next'
import { Container } from '@components/Container'
import { Header } from '@components/Header'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const LegalPage: NextPage<LegalPageProps> = ({ title, children }) => {
  const contentStyles = `
    [&_a]:text-primary [&_a]:underline
    [&_ul]:pl-4 [&_ul]:list-disc
    [&_ol]:pl-4 [&_ol]:list-decimal
    [&_ul_li_ul]:my-0 [&_ul_li_ul]:ml-4 [&_ul_li_ul]:list-circle
    [&_ol_li_ol]:my-0 [&_ol_li_ol]:ml-4
    [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:leading-4
  `

  return (
    <>
      <Header />
      <Container className='py-12'>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <div className='xl:w-5/6'>
            <h1 className='mb-4 font-sans text-3xl md:text-4xl'>{title}</h1>

            <section
              className={`font-sans font-light text-slate-800 ${contentStyles}`}
            >
              {children}
            </section>
          </div>
        </section>
      </Container>
    </>
  )
}

export { LegalPage }
