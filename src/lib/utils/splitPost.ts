import { Post } from '@lib/types'

export const splitPost = ({
  post
}: {
  post: Post
}): string[] | undefined | Post => {
  if (!post || !post.content) {
    return post
  }

  const sanitizedText = post.content.replace(/<p>&nbsp;<\/p>/gim, '')

  const paragraphs = sanitizedText.split('</p>')
  const firstParagraph = paragraphs.shift() + '</p>'
  const restParagraphs = paragraphs.join('</p>')

  return [firstParagraph, restParagraphs]
}
