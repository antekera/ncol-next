import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lo Más Leído'
}

export default function MasLeidosLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
