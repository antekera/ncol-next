import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'missing path' }, { status: 400 })
  }

  revalidatePath(path)

  return NextResponse.redirect(new URL(path, request.url))
}
