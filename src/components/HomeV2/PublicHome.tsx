import { Header } from '@components/Header'
import { HomeV2 } from '@components/HomeV2'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'

export default async function PublicHomeV2() {
  const data = await getHomeV2Data()
  // Keep failed snapshots out of ISR. Ordinary publication refreshes retain
  // healthy HTML through the public cache profile.
  if (data.errors.length) throw new Error('Home V2 editorial data unavailable')
  return (
    <>
      <Header />
      <HomeV2 data={data} publicRegionApi />
    </>
  )
}
