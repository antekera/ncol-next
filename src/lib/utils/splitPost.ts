import { PostsMorePosts } from '@lib/types'

export const splitPost = ({ post }: PostsMorePosts) => {
  if (!post.content) {
    return post
  }

  const paragraphs = post.content.split('<p>').slice(1)
  const firstParagraph = '<p>' + paragraphs.shift()
  const restParagraphs = paragraphs.map(p => '<p>' + p)
  return [firstParagraph, restParagraphs.join('')]
}
