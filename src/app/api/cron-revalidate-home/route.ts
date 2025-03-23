import { revalidateDataPath } from '@app/actions/revalidate'
import { NextResponse } from 'next/server'

export async function GET() {
  await revalidateDataPath('/')
  return NextResponse.json({ ok: true })
}
