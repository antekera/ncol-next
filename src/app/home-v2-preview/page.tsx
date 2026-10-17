import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@components/Header'
import { HomeV2 } from '@components/HomeV2'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'
import { isHomeV2PreviewEnabled } from '@lib/homeV2/preview'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Home V2 — vista previa',
  robots: { index: false, follow: false }
}

export default async function HomeV2Preview() {
  if (!isHomeV2PreviewEnabled()) notFound()
  const data = await getHomeV2Data()
  return (
    <>
      <Header />
      <HomeV2 data={data} />
    </>
  )
}
