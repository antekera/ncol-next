'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { query } from './query'

export interface OpinionAuthor {
  name: string
  slug: string
  uri: string
  avatarUrl: string
  latestPost: { title: string; uri: string }
}

async function fetchAuthorPhoto(id: number): Promise<string | null> {
  const wpBase = process.env.WORDPRESS_OPINION_API_URL?.replace(
    /\/wp-json\/.*/,
    ''
  )
  const secret = process.env.WORDPRESS_OPINION_API_SECRET ?? ''
  if (!wpBase) return null
  try {
    const res = await fetch(`${wpBase}/wp-json/ncol/v1/users/${id}/photo`, {
      cache: 'no-store',
      headers: { 'x-opinion-secret': secret }
    })
    if (!res.ok) return null
    const data = await res.json()
    const url = data?.foto_perfil_url
    return typeof url === 'string' && url ? url : null
  } catch {
    return null
  }
}

export async function getOpinionAuthors(max = 6): Promise<OpinionAuthor[]> {
  const data = await cachedFetchAPI<{
    posts: { edges: { node: any }[] }
  }>({
    revalidate: TIME_REVALIDATE.HOUR,
    tags: ['opinion-authors'],
    query,
    variables: { qty: max * 5 }
  })

  const edges = data?.posts?.edges ?? []
  const seen = new Set<number>()
  const authors: OpinionAuthor[] = []

  for (const { node } of edges) {
    const authorNode = node.author?.node
    if (!authorNode) continue
    const id: number = authorNode.databaseId
    if (seen.has(id)) continue
    seen.add(id)

    const photo = await fetchAuthorPhoto(id)
    const avatarUrl = photo ?? authorNode.avatar?.url ?? ''

    authors.push({
      name: authorNode.name,
      slug: authorNode.slug ?? '',
      uri: authorNode.uri ?? `/autor/${authorNode.slug}/`,
      avatarUrl,
      latestPost: { title: node.title, uri: node.uri }
    })

    if (authors.length >= max) break
  }

  return authors
}
