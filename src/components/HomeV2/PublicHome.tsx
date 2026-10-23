import { Header } from '@components/Header'
import { HomeV2 } from '@components/HomeV2'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'

export default async function PublicHomeV2() {
  const data = await getHomeV2Data()
  // Timed ISR retains healthy HTML on failure. Hard purges still need the
  // publication/cache work documented in phase 10 before enabling this entry.
  if (data.errors.length) throw new Error('Home V2 editorial data unavailable')
  return (
    <>
      <Header />
      <HomeV2 data={data} />
    </>
  )
}
