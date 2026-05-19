import { Header } from '@components/Header'
import { WorldCupBanner } from '@components/mundial/WorldCupBanner'

export default function CategoryLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header headerType='category' />
      <WorldCupBanner />
      {children}
    </>
  )
}
