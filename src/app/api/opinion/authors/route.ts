import { NextResponse } from 'next/server'
import { getOpinionAuthors } from '@app/actions/getOpinionAuthors'

export const revalidate = 3600

export async function GET() {
  const authors = await getOpinionAuthors()
  return NextResponse.json(authors)
}
