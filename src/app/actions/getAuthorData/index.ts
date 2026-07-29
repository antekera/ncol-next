'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { queryAuthorProfile } from './query'

export interface AuthorProfile {
  name: string
  slug: string
  uri: string
  description: string
  databaseId: number
  avatarUrl: string
}

export async function getAuthorProfile(
  slug: string
): Promise<AuthorProfile | null> {
  const data = await cachedFetchAPI<{
    user: {
      name: string
      slug: string
      uri: string
      description: string
      databaseId: number
      avatar: { url: string }
    } | null
  }>({
    revalidate: TIME_REVALIDATE.DAY,
    tags: [`author-${slug}`],
    query: queryAuthorProfile,
    variables: { slug }
  })

  const user = data?.user
  if (!user) return null

  let avatarUrl = user.avatar?.url ?? ''

  const wpBase = process.env.WORDPRESS_OPINION_API_URL?.replace(
    /\/wp-json\/.*/,
    ''
  )
  if (wpBase && user.databaseId) {
    try {
      const res = await fetch(
        `${wpBase}/wp-json/ncol/v1/users/${user.databaseId}/photo`,
        {
          next: { revalidate: TIME_REVALIDATE.DAY },
          headers: {
            'x-opinion-secret': process.env.WORDPRESS_OPINION_API_SECRET ?? ''
          }
        }
      )
      if (res.ok) {
        const userData = await res.json()
        const url = userData?.foto_perfil_url
        if (typeof url === 'string' && url) avatarUrl = url
      }
    } catch {
      // keep gravatar
    }
  }

  return {
    name: user.name,
    slug: user.slug,
    uri: user.uri,
    description: user.description ?? '',
    databaseId: user.databaseId,
    avatarUrl
  }
}
