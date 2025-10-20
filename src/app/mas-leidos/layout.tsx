import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Más leídos',
}

export default function MasLeidosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}