'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import type { PostsTagQueried } from '@lib/types'

import { query } from './query'

export async function getTagPagePosts({
  slug,
  qty,
  offset = 0
}: {
  slug: string
  qty: number
  offset?: number
}): Promise<PostsTagQueried | null> {
  const data = await cachedFetchAPI<{ posts: PostsTagQueried }>({
    query,
    variables: { slug, qty, offset },
    revalidate: TIME_REVALIDATE.DAY,
    tags: [`tag-${slug}`]
  })

  return data?.posts ?? null
}
