'use client'

import { usePathname } from 'next/navigation'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { HOME_QUICK_LINKS } from '@lib/constants'

export const MobileRankingLinks = () => {
  const pathname = usePathname()

  return (
    <nav
      className='flex w-full scrollbar-none items-center justify-center gap-1 overflow-x-auto border-b border-slate-200 bg-white py-1.5 text-xs md:hidden dark:border-neutral-700 dark:bg-neutral-800'
      aria-label='Accesos rápidos'
    >
      {HOME_QUICK_LINKS.map(({ name, href }) => {
        const isActive = pathname.replace(/\/$/, '') === href
        return (
          <HoverPrefetchLink
            key={name}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`hover:bg-primary rounded-full px-3 py-1 font-medium whitespace-nowrap transition-all duration-200 ease-in-out hover:text-white ${
              isActive
                ? 'bg-primary text-white'
                : 'text-slate-700 dark:text-neutral-300'
            }`}
          >
            {name}
          </HoverPrefetchLink>
        )
      })}
    </nav>
  )
}
