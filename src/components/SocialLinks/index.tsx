'use client'

import { Icon, icons } from '@components/Icon'
import { GA_EVENTS, SOCIAL_LINKS } from '@lib/constants'
import { GAEvent } from '@lib/utils'
import Link from 'next/link'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { cn } from '@lib/shared'

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
      className={cn(
        'social-links',
        vertical ? 'social-links-vertical' : 'social-links-horizontal',
        className
      )}
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
            className={cn(
              'social-link',
              showText ? 'social-link-with-text' : 'social-link-without-text',
              vertical ? 'social-link-vertical' : 'social-link-horizontal',
              showBackground
                ? 'social-link-with-background'
                : 'social-link-without-background'
            )}
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
                className={cn(
                  'social-link-text',
                  !showBackground && 'social-link-text-without-background'
                )}
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