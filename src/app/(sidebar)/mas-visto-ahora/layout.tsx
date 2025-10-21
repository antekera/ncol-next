import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lo Más Visto Ahora'
}

export default function MasVistoAhoraLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
