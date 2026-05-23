import { Container } from '@components/Container'
import { PageTitle } from '@components/PageTitle'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { VideosPageContent } from './VideosPageContent'

export async function generateMetadata() {
  return {
    ...sharedOpenGraph,
    title: 'Videos Recientes | NoticiasCol',
    description:
      'Vea los videos recientes y noticias destacadas en video de NoticiasCol.',
    alternates: {
      canonical: 'https://www.noticiascol.com/videos/'
    }
  }
}

export default function Page() {
  return (
    <>
      <PageTitle text='Videos Recientes' />
      <Container className='py-10'>
        <VideosPageContent />
      </Container>
    </>
  )
}
