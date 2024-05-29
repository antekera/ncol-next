import { Post, PostsMorePosts } from '@lib/types'

export const splitPost = ({
  post
}: Partial<PostsMorePosts>): string[] | undefined | Post => {
  if (!post || !post.content) {
    return post
  }

  const sanitizedText = post.content.replace(/<p>&nbsp;<\/p>/gim, '')

  const paragraphs = sanitizedText.split('</p>')
  const firstParagraph = paragraphs.shift() + '</p>'
  const restParagraphs = paragraphs.join('</p>')

  return [firstParagraph, restParagraphs]
}
