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
      <HoverPrefetchLink
        href='/denuncias'
        className={
          getLinkClasses() +
          ' ' +
          'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700'
        }
      >
        Denuncias
      </HoverPrefetchLink>
    </div>
  )
}
