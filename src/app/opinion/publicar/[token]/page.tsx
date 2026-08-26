import type { Metadata } from 'next'

import { OpinionClient } from '@lib/api/OpinionClient'
import OpinionPublishForm from '@components/opinion/OpinionPublishForm'

export const metadata: Metadata = {
  title: 'Publicar artículo | NoticiasCol',
  robots: { index: false, follow: false }
}

type Props = {
  params: Promise<{ token: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  config:
    'El servicio de publicación no está configurado. Inténtalo más tarde.',
  unauthorized:
    'Este enlace no es válido o el autor no está habilitado para publicar.',
  no_categories:
    'Tu cuenta está habilitada pero no tienes categorías asignadas. Escríbenos a prensa@noticiascol.com.',
  error: 'No se pudo conectar con el servicio. Inténtalo más tarde.'
}

function ErrorPage({ reason }: { reason: string }) {
  return (
    <main className='bg-muted/20 min-h-screen px-4 py-10 md:py-16'>
      <div className='bg-background mx-auto max-w-3xl rounded-xl border p-8 text-center shadow-sm'>
        <p className='text-muted-foreground text-sm'>
          {ERROR_MESSAGES[reason] ?? ERROR_MESSAGES.error}
        </p>
      </div>
    </main>
  )
}

export default async function OpinionPublishPage({ params }: Props) {
  const { token } = await params

  const opinion = new OpinionClient()
  const result = await opinion.getAuthorInfo(token)

  if (!result.ok) return <ErrorPage reason={result.reason} />

  return (
    <main className='bg-muted/20 min-h-screen px-4 py-10 md:py-16'>
      <OpinionPublishForm allowedCategories={result.categories} token={token} />
    </main>
  )
}
