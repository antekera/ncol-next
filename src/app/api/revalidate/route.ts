import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export const dynamic = 'force-dynamic'

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

    revalidateTag(`post-${normalizedPath}`, { expire: 0 })
    revalidatePath(path)

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

    return NextResponse.json({ ok: true, path })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'revalidation failed' }, { status: 500 })
  }
}
