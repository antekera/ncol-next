'use server'

import { fetchAPI } from '@app/actions/fetchAPI'
import { unstable_cache } from 'next/cache'
import { query } from './query'

export interface OpinionAuthor {
  name: string
  slug: string
  uri: string
  avatarUrl: string
  latestPost: { id?: string; title: string; uri: string }
}

async function fetchAuthorPhoto(id: number): Promise<string | null> {
  const wpBase = process.env.WORDPRESS_OPINION_API_URL?.replace(
    /\/wp-json\/.*/,
    ''
  )
  const secret = process.env.WORDPRESS_OPINION_API_SECRET ?? ''
  if (!wpBase) return null
  try {
    return await unstable_cache(
      async () => {
        const res = await fetch(`${wpBase}/wp-json/ncol/v1/users/${id}/photo`, {
          cache: 'no-store',
          headers: { 'x-opinion-secret': secret }
        })
        // Throw inside the cache boundary: an outage must not persist as null.
        if (!res.ok) throw new Error('Opinion portrait unavailable')
        const data = await res.json()
        if (!data || !Object.hasOwn(data, 'foto_perfil_url'))
          throw new Error('Invalid opinion portrait')
        const url = data.foto_perfil_url
        return typeof url === 'string' && url ? url : null
      },
      ['opinion-author-photo-v1', wpBase, String(id)],
      { revalidate: 86400, tags: ['opinion-author-photos'] }
    )()
  } catch {
    return null
  }
}

export async function getOpinionAuthors(max = 6): Promise<OpinionAuthor[]> {
  const data = await fetchAPI<{
    posts: { edges: { node: any }[] }
  }>({
    query,
    variables: { qty: max * 5 }
  })

  if (!Array.isArray(data?.posts?.edges))
    throw new Error('Opinion authors unavailable')
  const edges = data.posts.edges
  const seen = new Set<number>()
  const selected: { node: any; authorNode: any }[] = []

  for (const { node } of edges) {
    const authorNode = node.author?.node
    if (!authorNode) continue
    const id: number = authorNode.databaseId
    if (seen.has(id)) continue
    seen.add(id)

    selected.push({ node, authorNode })
    if (selected.length >= max) break
  }

  return Promise.all(
    selected.map(async ({ node, authorNode }) => {
      const photo = await fetchAuthorPhoto(authorNode.databaseId)
      return {
        name: authorNode.name,
        slug: authorNode.slug ?? '',
        uri: authorNode.uri ?? `/autor/${authorNode.slug}/`,
        avatarUrl: photo ?? authorNode.avatar?.url ?? '',
        latestPost: {
          ...(typeof node.id === 'string' && node.id ? { id: node.id } : {}),
          title: node.title,
          uri: node.uri
        }
      }
    })
  )
}
