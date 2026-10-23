export const revalidate = 7200

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
