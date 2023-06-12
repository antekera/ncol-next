import { PostsMorePosts } from '@lib/types'

export const splitPost = ({ post }: PostsMorePosts) => {
  if (!post.content) {
    return post
  }

  const sanitizedText = post.content.replace(/<p>&nbsp;<\/p>/gim, '')
  const [first] = sanitizedText.split('</p>')
  const firstParagraph = `${first}${'</p>'}`
  const restParagraph = sanitizedText.replace(/^<p>.*?<\/p>/, '')

  return [firstParagraph, restParagraph]
}
