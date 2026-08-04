'use client'

import useSWR from 'swr'
import { clientFetchAPI } from './useFetchAPI'

export interface OpinionAuthor {
  name: string
  slug: string
  uri: string
  avatarUrl: string
  latestPost: { title: string; uri: string }
}

const query = `
  query OpinionAuthors($qty: Int!) {
    posts(
      first: $qty
      where: {
        categoryName: "opinion"
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      edges {
        node {
          title
          uri
          author {
            node {
              name
              slug
              uri
              databaseId
              avatar {
                url
              }
            }
          }
        }
      }
    }
  }
`

async function fetchOpinionAuthors(): Promise<OpinionAuthor[]> {
  const max = 6
  const data = await clientFetchAPI<{ posts: { edges: { node: any }[] } }>({
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

    authors.push({
      name: authorNode.name,
      slug: authorNode.slug ?? '',
      uri: authorNode.uri ?? `/autor/${authorNode.slug}/`,
      avatarUrl: authorNode.avatar?.url ?? '',
      latestPost: { title: node.title, uri: node.uri }
    })

    if (authors.length >= max) break
  }

  return authors
}

export function useOpinionAuthors() {
  const { data, error, isLoading } = useSWR<OpinionAuthor[]>(
    'opinion-authors',
    fetchOpinionAuthors,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  return { authors: data ?? [], error, isLoading }
}
