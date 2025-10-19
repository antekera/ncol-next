'use client'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getContainerClasses, getLinkClasses, getSeparatorClasses } from './styles'

export const MobileRankingLinks = () => {
  return (
    <div className={getContainerClasses()}>
      <Link href="/mas-leidos" className={getLinkClasses()}>
        <Plus className="relative -top-0.5 mr-1 inline text-xs" />
        Más leídos
      </Link>
      <div className={getSeparatorClasses()} />
      <Link href="/mas-visto-ahora" className={getLinkClasses()}>
        <Plus className="relative -top-0.5 mr-1 inline text-xs" />
        Más visto ahora
      </Link>
    </div>
  )
}