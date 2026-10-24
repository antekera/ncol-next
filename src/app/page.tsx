// Upper bound only. Editorial data/profile set shorter lifetimes; legacy Home
// retains its existing one-hour dependency. Quiet public nights can reach 6h.
export const revalidate = 21600

import type { Metadata } from 'next'
import HomeEntry from '@components/HomeEntry'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'

export const metadata: Metadata = {
  ...sharedOpenGraph,
  alternates: { canonical: 'https://www.noticiascol.com/' }
}

export default function Page() {
  return <HomeEntry />
}
