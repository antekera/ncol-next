import { Header } from '@components/Header'

export default function CategoryLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header headerType='category' />
      {children}
    </>
  )
}
