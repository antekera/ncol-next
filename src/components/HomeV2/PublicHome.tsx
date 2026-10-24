import { Header } from '@components/Header'
import { HomeV2 } from '@components/HomeV2'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'
import { isHomeV2DurableCacheEnabled } from '@lib/homeV2/release'
import { getHomeEditorialEditions } from '@lib/homeV2/editorialEditions'
import type { HomeV2Data } from '@lib/homeV2/types'
import {
  publicHomeExpiresAt,
  publicHomeSnapshotKey,
  publicHomeSnapshotTag
} from '@lib/homeV2/publicCachePolicy'
import { cachePublicHomeUntil } from '@lib/homeV2/publicHomeLifetime'

export default async function PublicHomeV2() {
  const data = await getHomeV2Data()
  // Keep failed snapshots out of ISR. Ordinary publication refreshes retain
  // healthy HTML through the public cache profile.
  if (data.errors.length) throw new Error('Home V2 editorial data unavailable')
  return (
    <>
      <Header />
      {isHomeV2DurableCacheEnabled() ? (
        <PublicEditorialContent data={data} />
      ) : (
        <HomeV2 data={data} publicRegionApi />
      )}
    </>
  )
}

async function PublicEditorialContent({ data }: { data: HomeV2Data }) {
  const { getPublicHomeSnapshot } = await import('@lib/homeV2/publicSnapshot')
  const { revision } = await getPublicHomeSnapshot()
  const snapshotReceipt = `${publicHomeSnapshotTag(publicHomeSnapshotKey())}:${revision}`
  // Resolve eligibility when content renders, after any preceding work. A
  // boundary can also pass while awaiting the cache scope. Repeat only then,
  // using the same data rather than querying the CMS/store again.
  for (;;) {
    const now = Date.now()
    const editions = getHomeEditorialEditions(data, now)
    const expiresAt = publicHomeExpiresAt(
      now,
      editions.map(edition => edition.at)
    )
    await cachePublicHomeUntil(expiresAt, now)
    if (Date.now() >= expiresAt) continue
    return (
      <HomeV2
        data={editions[0].data}
        publicRegionApi
        editorialView={{ now, editions }}
        snapshotReceipt={snapshotReceipt}
      />
    )
  }
}
