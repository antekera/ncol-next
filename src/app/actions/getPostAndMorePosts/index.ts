'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import type {
  InlineRelatedPost,
  Post,
  RelatedPosts,
  PostsQueried,
  SinglePost
} from '@lib/types'
import { getCategoryNode, getMainWordFromSlug } from '@lib/utils'
import { queryMetaData, query, queryRelatedPosts } from './query'

const URI = 'URI'

export const getMetadataPosts = async (
  slug: string
): Promise<Partial<SinglePost>> => {
  const data = await cachedFetchAPI<SinglePost>({
    revalidate: TIME_REVALIDATE.WEEK,
    tags: [`post-${slug}`],
    query: queryMetaData,
    variables: {
      id: slug,
      idType: URI
    }
  })

  return data ?? {}
}

export const getSinglePost = async (
  slug: string
): Promise<{
  post?: Post
  inlineRelatedPost?: InlineRelatedPost | null
  relatedPosts?: PostsQueried['edges']
}> => {
  const data = await cachedFetchAPI<{ post: Post }>({
    revalidate: TIME_REVALIDATE.WEEK,
    tags: [`post-${slug}`],
    query: query({ isRevision: false }),
    variables: {
      id: slug,
      idType: 'URI'
    }
  })

  const post = data?.post
  if (!post) {
    return {}
  }

  const categoryName = getCategoryNode(post.categories)?.slug
  const relatedData = await cachedFetchAPI<RelatedPosts>({
    revalidate: TIME_REVALIDATE.WEEK,
    tags: [`post-${slug}`, `post-${slug}-inline-related`],
    query: queryRelatedPosts,
    variables: {
      categoryName: categoryName || undefined,
      search: categoryName
        ? undefined
        : getMainWordFromSlug(post.slug) || 'noticias'
    }
  })

  const inlineRelatedPost =
    relatedData?.posts?.edges
      ?.map(({ node }) => node)
      .find(node => node.slug !== post.slug && node.uri !== post.uri) ?? null

  return {
    post,
    inlineRelatedPost: inlineRelatedPost
      ? {
          title: inlineRelatedPost.title,
          uri: inlineRelatedPost.uri,
          featuredImage: inlineRelatedPost.featuredImage
        }
      : null,
    relatedPosts: relatedData?.posts?.edges
  }
}
