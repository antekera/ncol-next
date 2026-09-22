'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import type { PostsCategoryQueried } from '@lib/types'

import { query } from './query'

export async function getCategoryPagePosts({
  slug,
  qty,
  offset = 0
}: {
  slug: string
  qty: number
  offset?: number
}): Promise<PostsCategoryQueried | null> {
  const data = await cachedFetchAPI<{ posts: PostsCategoryQueried }>({
    query,
    variables: { slug, qty, offset, content: true },
    revalidate: TIME_REVALIDATE.DAY,
    tags: [`category-${slug}`]
  })

  return data?.posts ?? null
}
