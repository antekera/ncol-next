import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import {
  CloudFrontClient,
  CreateInvalidationCommand
} from '@aws-sdk/client-cloudfront'
import * as Sentry from '@sentry/nextjs'
import { log } from '@logtail/next'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'missing path' }, { status: 400 })
  }

  try {
    // 1. Invalidate Next.js Data Cache Tag and Path Cache
    revalidateTag(`post-${path}`, { expire: 0 })
    revalidatePath(path)

    // 2. Invalidate CloudFront Cache if Distribution ID is configured
    const distributionId = process.env.YOUR_CF_DISTRIBUTION_ID
    const accessKeyId = process.env.CLOUDFRONT_ACCESS_KEY_ID
    const secretAccessKey = process.env.CLOUDFRONT_SECRET_ACCESS_KEY

    if (distributionId) {
      const clientConfig: any = { region: 'us-east-1' }
      if (accessKeyId && secretAccessKey) {
        clientConfig.credentials = {
          accessKeyId,
          secretAccessKey
        }
      }

      const cfClient = new CloudFrontClient(clientConfig)

      // CloudFront paths must start with a slash and can include wildcards, e.g. "/path"
      const cfPath = path.startsWith('/') ? path : `/${path}`

      const invalidationCommand = new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: `revalidate-${Date.now()}`,
          Paths: {
            Quantity: 1,
            Items: [cfPath]
          }
        }
      })

      await cfClient.send(invalidationCommand)
      log.info('CloudFront cache invalidation triggered successfully', {
        path: cfPath,
        distributionId
      })
    } else {
      log.warn(
        'CloudFront invalidation skipped: YOUR_CF_DISTRIBUTION_ID not set'
      )
    }
  } catch (error) {
    log.error('Cache revalidation failed', {
      error: error instanceof Error ? error.message : String(error)
    })
    Sentry.captureException(error)
  }

  // 3. Redirect back to the path and ensure no-cache headers are set
  const response = NextResponse.redirect(new URL(path, request.url))
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0'
  )
  return response
}
