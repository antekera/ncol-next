import type { Metadata } from 'next'

import OpinionPublishForm from '@components/opinion/OpinionPublishForm'

export const metadata: Metadata = {
  title: 'Publicar artículo de Opinión | NoticiasCol',
  robots: { index: false, follow: false }
}

type Props = {
  params: Promise<{ token: string }>
}

export default async function OpinionPublishPage({ params }: Props) {
  const { token } = await params

  return (
    <main className='min-h-screen bg-muted/20 px-4 py-10 md:py-16'>
      <OpinionPublishForm token={token} />
    </main>
  )
}
