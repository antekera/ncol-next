import { NextResponse } from 'next/server'

import { revalidateDataPath } from '@app/actions/revalidate'

export async function GET() {
  await revalidateDataPath('/')
  return NextResponse.json({ ok: true })
}
