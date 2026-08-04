import { Header } from '@components/Header'

export default function PublicarLayout({
  children
}: {
  readonly children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
