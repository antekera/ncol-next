'use client'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { GAEvent } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'

type Props = { href: string; title: string }

const PostHeroTitleLink = ({ href, title }: Props) => (
  <HoverPrefetchLink
    href={href}
    className='hover:text-primary dark:text-neutral-300 dark:hover:text-neutral-100'
    aria-label={title}
    onClick={() =>
      GAEvent({
        category: GA_EVENTS.POST_LINK.COVER.CATEGORY,
        label: GA_EVENTS.POST_LINK.COVER.LABEL
      })
    }
  >
    {title}
  </HoverPrefetchLink>
)

export { PostHeroTitleLink }
