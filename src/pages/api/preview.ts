import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { getPreviewPost } from '@lib/api'

interface ResponseData {
  message: string
}

const previewHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const { secret, id, slug } = req.query

  // Check the secret and next parameters
  // This secret should only be known by this API route
  if (
    !process.env.WORDPRESS_PREVIEW_SECRET ||
    secret !== process.env.WORDPRESS_PREVIEW_SECRET ||
    (!id && !slug)
  ) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // Fetch WordPress to check if the provided `id` or `slug` exists
  // @ts-ignore
  const post = await getPreviewPost(id || slug, id ? 'DATABASE_ID' : 'SLUG')

  // If the post doesn't exist prevent preview mode from being enabled
  if (!post) {
    return res.status(401).json({ message: 'Post not found' })
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({
    post: {
      id: post.id,
      slug: post.slug,
      status: post.status
    }
  })

  // Redirect to the path from the fetched post
  // We don't redirect to `req.query.slug` as that might lead to open redirect vulnerabilities
  res.writeHead(307, { Location: `/posts/${post.slug || post.id}` })
  res.end()
}

export default withSentry(previewHandler)
