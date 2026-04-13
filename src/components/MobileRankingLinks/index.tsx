import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { prioritiseLinks } from '@lib/utils/prioritiseLinks'
import { getContainerClasses, getLinkClasses } from './styles'

export const TITLE_VISTO = '+ Visto Hoy'
export const TITLE_LEIDO = '+ Leído'

export const MobileRankingLinks = () => {
  const links = prioritiseLinks()

  return (
    <div className={getContainerClasses()}>
      {links.map(({ name, href, color, icon: Icon, target }) => (
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
