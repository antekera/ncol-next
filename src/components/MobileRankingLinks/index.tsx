'use client'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { getContainerClasses, getLinkClasses } from './styles'

export const TITLE_VISTO = '+ Visto Hoy'
export const TITLE_LEIDO = '+ Leído'

export const MobileRankingLinks = () => {
  return (
    <div className={getContainerClasses()}>
      <HoverPrefetchLink href='/mas-leidos' className={getLinkClasses()}>
        {TITLE_LEIDO}
      </HoverPrefetchLink>
      <HoverPrefetchLink href='/mas-visto-hoy' className={getLinkClasses()}>
        {TITLE_VISTO}
      </HoverPrefetchLink>
    </div>
  )
}
