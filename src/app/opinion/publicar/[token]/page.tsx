import * as Sentry from '@sentry/nextjs'
import type { Metadata } from 'next'

import OpinionPublishForm from '@components/opinion/OpinionPublishForm'

export const metadata: Metadata = {
  title: 'Publicar artículo | NoticiasCol',
  robots: { index: false, follow: false }
}

type Props = {
  params: Promise<{ token: string }>
}

type AllowedCategory = { slug: string; name: string }

type AuthorResult =
  | { ok: true; categories: AllowedCategory[] }
  | { ok: false; reason: 'config' | 'unauthorized' | 'no_categories' | 'error' }

async function getAuthorInfo(token: string): Promise<AuthorResult> {
  const articlesUrl = process.env.WORDPRESS_OPINION_API_URL
  const secret = process.env.WORDPRESS_OPINION_API_SECRET
  if (!articlesUrl || !secret) {
    return { ok: false, reason: 'config' }
  }

  const authorUrl = articlesUrl.replace(/\/articles$/, '/author')
  try {
    const res = await fetch(`${authorUrl}?token=${encodeURIComponent(token)}`, {
      headers: { 'X-Opinion-Secret': secret },
      cache: 'no-store'
    })
    if (!res.ok) {
      return { ok: false, reason: 'unauthorized' }
    }
    const data = await res.json()
    const categories: AllowedCategory[] = Array.isArray(data.allowedCategories)
      ? data.allowedCategories
      : []
    if (categories.length === 0) {
      return { ok: false, reason: 'no_categories' }
    }
    return { ok: true, categories }
  } catch (err) {
    Sentry.captureException(err)
    return { ok: false, reason: 'error' }
  }
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

export default async function OpinionPublishPage({ params }: Props) {
  const { token } = await params
  const result = await getAuthorInfo(token)
  if (!result.ok) {
    return (
      <main className='bg-muted/20 min-h-screen px-4 py-10 md:py-16'>
        <div className='bg-background mx-auto max-w-3xl rounded-xl border p-8 text-center shadow-sm'>
          <p className='text-muted-foreground text-sm'>
            {ERROR_MESSAGES[result.reason]}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className='bg-muted/20 min-h-screen px-4 py-10 md:py-16'>
      <OpinionPublishForm allowedCategories={result.categories} token={token} />
    </main>
  )
}
