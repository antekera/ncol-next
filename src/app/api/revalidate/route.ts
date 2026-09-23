import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export const dynamic = 'force-dynamic'

function getRequestedPaths(request: NextRequest): {
  paths?: string[]
  error?: string
} {
  const singlePath = request.nextUrl.searchParams.get('path')
  const encodedPaths = request.nextUrl.searchParams.get('paths')
  let paths: unknown = singlePath ? [singlePath] : null

  if (encodedPaths) {
    try {
      paths = JSON.parse(encodedPaths) as unknown
    } catch {
      return { error: 'invalid paths' }
    }
  }

  if (!Array.isArray(paths) || paths.length === 0 || paths.length > 50) {
    return { error: 'missing or invalid paths' }
  }

  if (
    paths.some(
      (path: unknown) =>
        typeof path !== 'string' ||
        path.length > 2048 ||
        !path.startsWith('/') ||
        path.startsWith('//') ||
        path.includes('://') ||
        path.includes('\\')
    )
  ) {
    return { error: 'invalid path' }
  }

  return { paths: [...new Set(paths as string[])] }
}

function revalidateFrontendPath(path: string): void {
  // Normalize: strip trailing slash for tag matching (Next.js builds slugs without it)
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '')

  revalidateTag(`post-${normalizedPath}`, { expire: 0 })
  revalidatePath(path)

  if (path === '/') {
    revalidateTag('homepage', { expire: 0 })
    revalidateTag('featured-post', { expire: 0 })
  } else if (path.startsWith('/categoria/')) {
    const segments = path.split('/').filter(Boolean)
    const categorySlug = segments[segments.length - 1]
    if (categorySlug && categorySlug !== 'categoria') {
      revalidateTag(`category-${categorySlug}`, { expire: 0 })
      revalidateTag(`today-yesterday-${categorySlug}`, { expire: 0 })
    }
  } else if (path.startsWith('/etiqueta/')) {
    const segments = path.split('/').filter(Boolean)
    const tagSlug = segments[segments.length - 1]
    if (tagSlug && tagSlug !== 'etiqueta') {
      revalidateTag(`tag-${tagSlug}`, { expire: 0 })
    }
  }
}

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET
  const secret = request.nextUrl.searchParams.get('secret')

  if (!expectedSecret || !secret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const result = getRequestedPaths(request)
  if (result.error || !result.paths) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  try {
    result.paths.forEach(revalidateFrontendPath)

    return NextResponse.json(
      result.paths.length === 1
        ? { ok: true, path: result.paths[0] }
        : { ok: true, paths: result.paths }
    )
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'revalidation failed' }, { status: 500 })
  }
}
