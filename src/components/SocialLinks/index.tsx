'use client'

import { Icon, icons } from '@components/Icon'
import { GA_EVENTS, SOCIAL_LINKS } from '@lib/constants'
import { GAEvent } from '@lib/utils'
import Link from 'next/link'
import { useIsMobile } from '@lib/hooks/useIsMobile'

type SocialLinksProps = {
  showText?: boolean
  vertical?: boolean
  className?: string
  showBackground?: boolean
}

type SocialLinkData = {
  id: string
  link: string
  size?: string
  text?: string
}

const SocialLinks = ({
  showText = false,
  vertical = false,
  className = '',
  showBackground = false
}: SocialLinksProps) => {
  const isMobile = useIsMobile()

  return (
    <div
      className={`flex ${vertical ? 'flex-col gap-3' : 'flex-row gap-3'} ${className}`}
    >
      {SOCIAL_LINKS.filter(({ id }: SocialLinkData) => {
        return isMobile || id !== 'whatsapp'
      }).map(({ id, link, size, text }: SocialLinkData) => {
        const iconColor = icons[`${id}`]?.color || '#000000'

        return (
          <Link
            key={id}
            target='_blank'
            href={link}
            className={`group flex w-full items-center ${showText ? '' : 'justify-center'} ${vertical ? 'gap-3' : 'gap-2'} ${showBackground
              ? `rounded-lg px-4 py-2 transition-all hover:opacity-90`
              : 'hover:text-primary transition-colors'
              }`}
            style={
              showBackground
                ? { backgroundColor: iconColor, color: '#fff' }
                : undefined
            }
            title={text}
            onClick={() =>
              GAEvent({
                category: GA_EVENTS.SOCIAL_LINK.CATEGORY,
                label: id.toUpperCase()
              })
            }
          >
            <Icon network={id} width={showText ? 'w-5' : 'w-4'} size={size} />
            {showText && (
              <span
                className={`font-sans text-sm font-medium ${!showBackground && 'text-slate-700 dark:text-neutral-300'}`}
              >
                {text}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export { SocialLinks }
