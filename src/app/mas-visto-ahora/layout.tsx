import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Más visto ahora',
}

export default function MasVistoAhoraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}