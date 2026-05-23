import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import {
  CloudFrontClient,
  CloudFrontClientConfig,
  CreateInvalidationCommand
} from '@aws-sdk/client-cloudfront'
import * as Sentry from '@sentry/nextjs'
import { log } from '@logtail/next'

export const dynamic = 'force-dynamic'

async function invalidateCloudFront(path: string): Promise<void> {
  const distributionId = process.env.YOUR_CF_DISTRIBUTION_ID
  const accessKeyId = process.env.CLOUDFRONT_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFRONT_SECRET_ACCESS_KEY

  if (!distributionId) {
    log.warn('CloudFront invalidation skipped: YOUR_CF_DISTRIBUTION_ID not set')
    return
  }

  const clientConfig: CloudFrontClientConfig = { region: 'us-east-1' }
  if (accessKeyId && secretAccessKey) {
    clientConfig.credentials = { accessKeyId, secretAccessKey }
  }

  const cfClient = new CloudFrontClient(clientConfig)
  const cfPath = path.startsWith('/') ? path : `/${path}`

  const invalidationCommand = new CreateInvalidationCommand({
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `revalidate-${Date.now()}`,
      Paths: { Quantity: 1, Items: [cfPath] }
    }
  })

  await cfClient.send(invalidationCommand)
  log.info('CloudFront cache invalidation triggered successfully', {
    path: cfPath,
    distributionId
  })
}

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET
  const secret = request.nextUrl.searchParams.get('secret')

  if (!expectedSecret || !secret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'missing path' }, { status: 400 })
  }

  // Prevent open redirect — only allow relative paths, no external URLs
  if (!path.startsWith('/') || path.includes('://')) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 })
  }

  try {
    // Normalize: strip trailing slash for tag matching (Next.js builds slugs without it)
    const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '')

    // 1. Invalidate Next.js Data Cache Tag and Path Cache
    revalidateTag(`post-${normalizedPath}`, { expire: 0 })
    revalidatePath(path)

    // Additional tag revalidations for homepage and category lists
    if (path === '/' || path === '') {
      revalidateTag('homepage', { expire: 0 })
      revalidateTag('featured-post', { expire: 0 })
    } else if (path.startsWith('/categoria/')) {
      const segments = path.split('/').filter(Boolean)
      const categorySlug = segments[segments.length - 1]
      if (categorySlug && categorySlug !== 'categoria') {
        revalidateTag(`category-${categorySlug}`, { expire: 0 })
        revalidateTag(`today-yesterday-${categorySlug}`, { expire: 0 })
      }
    }

    // 2. Invalidate CloudFront Cache
    await invalidateCloudFront(path)

    return NextResponse.json({ ok: true, path })
  } catch (error) {
    log.error('Cache revalidation failed', {
      error: error instanceof Error ? error.message : String(error)
    })
    Sentry.captureException(error)
    return NextResponse.json({ error: 'revalidation failed' }, { status: 500 })
  }
}
