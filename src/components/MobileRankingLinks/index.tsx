'use client'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { SERVICES_MENU } from '@lib/constants'
import { getContainerClasses, getLinkClasses } from './styles'

export const TITLE_VISTO = '+ Visto Hoy'
export const TITLE_LEIDO = '+ Leído'

export const MobileRankingLinks = () => {
  return (
    <div className={getContainerClasses()}>
      {SERVICES_MENU.map(({ name, href, color, icon: Icon, target }) => (
        <HoverPrefetchLink
          key={name}
          href={href}
          target={target}
          className={`${getLinkClasses()} ${color}`}
        >
          {Icon && <Icon size={14} className='opacity-90' />}
          {name}
        </HoverPrefetchLink>
      ))}
    </div>
  )
}
