'use client'

import { usePathname } from 'next/navigation'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { HOME_QUICK_LINKS } from '@lib/constants'
import { getContainerClasses, getLinkClasses } from './styles'

export const TITLE_VISTO = '+ Visto Hoy'
export const TITLE_LEIDO = '+ Leído'

export const MobileRankingLinks = () => {
  const pathname = usePathname()

  return (
    <nav className={getContainerClasses()} aria-label='Accesos rápidos'>
      {HOME_QUICK_LINKS.map(({ name, href }) => {
        const isActive = pathname === href
        return (
          <HoverPrefetchLink
            key={name}
            href={href}
            className={getLinkClasses(isActive)}
            aria-current={isActive ? 'page' : undefined}
          >
            {name}
          </HoverPrefetchLink>
        )
      })}
    </nav>
  )
}
