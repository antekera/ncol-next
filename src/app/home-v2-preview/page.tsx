import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@components/Header'
import { HomeV2 } from '@components/HomeV2'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'
import {
  isHomeV2PreviewEnabled,
  isHomeV2PerformanceAuditEnabled,
  prepareHomeV2Preview
} from '@lib/homeV2/preview'
import { HOME_PAGE_TITLE } from '@lib/constants'

export const dynamic = 'force-dynamic'
export function generateMetadata(): Metadata {
  return {
    title: isHomeV2PerformanceAuditEnabled()
      ? { absolute: HOME_PAGE_TITLE }
      : 'Home V2 — vista previa',
    robots: { index: false, follow: false }
  }
}

export default async function HomeV2Preview() {
  if (!isHomeV2PreviewEnabled()) notFound()
  const data = await getHomeV2Data()
  return (
    <>
      <Header />
      <HomeV2 data={prepareHomeV2Preview(data)} />
    </>
  )
}
