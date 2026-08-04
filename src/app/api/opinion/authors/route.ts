import { NextResponse } from 'next/server'
import { getOpinionAuthors } from '@app/actions/getOpinionAuthors'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authors = await getOpinionAuthors()
  return NextResponse.json(authors)
}
