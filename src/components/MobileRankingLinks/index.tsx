'use client'
import Link from 'next/link'
import { getContainerClasses, getLinkClasses } from './styles'

export const TITLE_VISTO = '+ Visto Ahora'
export const TITLE_LEIDO = '+ Leído'

export const MobileRankingLinks = () => {
  return (
    <div className={getContainerClasses()}>
      <Link href='/mas-leidos' className={getLinkClasses()}>
        {TITLE_LEIDO}
      </Link>
      <Link href='/mas-visto-ahora' className={getLinkClasses()}>
        {TITLE_VISTO}
      </Link>
    </div>
  )
}
