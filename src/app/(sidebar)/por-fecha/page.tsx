import type { Metadata } from 'next'
import { Container } from '@components/Container'
import { Newsletter } from '@components/Newsletter'
import { Sidebar } from '@components/Sidebar'
import { Content } from '@blocks/content/RecentPosts'
import { CMS_URL, PAGE_DESCRIPTION } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'

const canonicalUrl = `${CMS_URL}/por-fecha/`
const description =
  'Archivo cronológico de Noticiascol con las publicaciones más recientes de Venezuela, sucesos, deportes y actualidad.'

export const metadata: Metadata = {
  ...sharedOpenGraph,
  title: 'Lo último',
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    ...sharedOpenGraph.openGraph,
    url: canonicalUrl,
    title: 'Lo último',
    description
  },
  twitter: {
    ...sharedOpenGraph.twitter,
    title: 'Lo último',
    description
  }
}

export default function Page() {
  return (
    <>
      <div className='border-b border-slate-200 text-slate-900 dark:border-neutral-500'>
        <Container className='text-left'>
          <h1 className='py-3 font-sans text-2xl md:py-6 md:text-3xl dark:text-neutral-300'>
            Lo último.
          </h1>
          <p className='pb-4 text-sm text-slate-600 dark:text-neutral-400'>
            {PAGE_DESCRIPTION}
          </p>
        </Container>
      </div>
      <Container className='py-10' sidebar>
        <Newsletter className='mb-4 w-full md:hidden' />
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <Content />
        </section>
        <Sidebar hideMostVisited />
      </Container>
    </>
  )
}
