'use client'

import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { HOME_QUICK_LINKS } from '@lib/constants'
import { getContainerClasses, getLinkClasses } from './styles'

export const TITLE_VISTO = '+ Visto Hoy'
export const TITLE_LEIDO = '+ Leído'

export const MobileRankingLinks = () => {
  return (
    <nav className={getContainerClasses()} aria-label='Accesos rápidos'>
      {HOME_QUICK_LINKS.map(({ name, href, color }) => (
        <HoverPrefetchLink
          key={name}
          href={href}
          className={getLinkClasses(color)}
        >
          {name}
        </HoverPrefetchLink>
      ))}
    </nav>
  )
}
