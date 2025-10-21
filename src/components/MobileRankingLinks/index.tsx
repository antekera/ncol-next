'use client'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getContainerClasses, getLinkClasses, getSeparatorClasses } from './styles'

export const TITLE_VISTO = '+ Visto Ahora'
export const TITLE_LEIDO = '+ Leído'

export const MobileRankingLinks = () => {
  return (
    <div className={getContainerClasses()}>
      <Link href="/mas-leidos" className={getLinkClasses()}>
        <Plus className="relative -top-0.5 mr-1 inline text-xs" />
        {TITLE_LEIDO}
      </Link>
      <div className={getSeparatorClasses()} />
      <Link href="/mas-visto-ahora" className={getLinkClasses()}>
        <Plus className="relative -top-0.5 mr-1 inline text-xs" />
        {TITLE_VISTO}
      </Link>
    </div>
  )
}