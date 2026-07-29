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
  profession: string
  biography: string
}

type PluginUserData = {
  foto_perfil_url?: string | null
  profession?: string
  biography?: string
}

function resolveAvatarUrl(foto: unknown): string | null {
  if (Array.isArray(foto)) return (foto as { url?: string }).url ?? null
  if (typeof foto === 'string' && foto !== '') return foto
  if (typeof foto === 'number' && foto > 0) return null // attachment ID — handled by caller
  return null
}

async function fetchPluginUserData(
  wpBase: string,
  databaseId: number,
  secret: string
): Promise<PluginUserData> {
  const res = await fetch(
    `${wpBase}/wp-json/ncol/v1/users/${databaseId}/photo`,
    {
      next: { revalidate: TIME_REVALIDATE.DAY },
      headers: { 'x-opinion-secret': secret }
    }
  )
  if (!res.ok) return {}
  return (await res.json()) as PluginUserData
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
  let profession = ''
  let biography = ''

  const wpBase = process.env.WORDPRESS_OPINION_API_URL?.replace(
    /\/wp-json\/.*/,
    ''
  )
  if (wpBase && user.databaseId) {
    try {
      const pluginData = await fetchPluginUserData(
        wpBase,
        user.databaseId,
        process.env.WORDPRESS_OPINION_API_SECRET ?? ''
      )
      const resolved = resolveAvatarUrl(pluginData.foto_perfil_url)
      if (resolved) avatarUrl = resolved
      if (typeof pluginData.profession === 'string')
        profession = pluginData.profession
      if (typeof pluginData.biography === 'string')
        biography = pluginData.biography
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
    avatarUrl,
    profession,
    biography
  }
}
