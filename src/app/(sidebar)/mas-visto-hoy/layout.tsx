import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lo Más Visto Hoy'
}

export default function MasVistoAhoraLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
