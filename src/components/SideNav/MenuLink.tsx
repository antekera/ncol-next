'use client'

import { AlertCircle } from 'lucide-react'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { MENU } from '@lib/constants'
import { categoryName } from '@lib/utils'
import { Link as LinkType } from '@lib/types'

const HOME_HREF = MENU[0].href
const HOME_PATH = '/'

type MenuLinkProps = {
  item: LinkType
  small?: boolean
  main?: boolean
  footer?: boolean
  bottomBar?: boolean
  prefix?: boolean
  bgDark?: boolean
  className?: string
}

const MenuLink = ({
  item,
  small,
  main,
  footer,
  bottomBar,
  prefix,
  bgDark,
  className
}: MenuLinkProps) => {
  const { name, href, icon: Icon } = item
  const HREF = name === HOME_HREF ? HOME_PATH : href
  const isSunday = new Date().getDay() === 0
  const showIndicator = isSunday && name === 'Horóscopo'

  const Indicator = () => (
    <div className='absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center'>
      <AlertCircle className='h-3.5 w-3.5 animate-pulse fill-orange-500 text-white shadow-none' />
    </div>
  )

  const Badge = ({
    text,
    top = '-top-1',
    left = 'left-12'
  }: {
    text: string
    top?: string
    left?: string
  }) => (
    <span
      className={`absolute ${top} ${left} -translate-x-1/2 animate-pulse text-[7px] font-bold tracking-tighter whitespace-nowrap text-orange-600 uppercase`}
    >
      {text}
    </span>
  )

  if (bottomBar)
    return (
      <HoverPrefetchLink
        href={HREF}
        target={item.target}
        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
        className='link-bottom-bar relative hover:text-white'
      >
        {name}
        {showIndicator && <Indicator />}
        {item.badge && <Badge text={item.badge} />}
      </HoverPrefetchLink>
    )

  if (footer)
    return (
      <li className='list-none'>
        <HoverPrefetchLink
          href={HREF}
          target={item.target}
          rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
          className='link-footer relative inline-block pb-3 hover:text-white md:pb-2'
        >
          {categoryName(name, prefix)}
          {showIndicator && <Indicator />}
          {item.badge && <Badge text={item.badge} />}
        </HoverPrefetchLink>
      </li>
    )

  if (main)
    return (
      <HoverPrefetchLink
        href={HREF}
        target={item.target}
        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
        className={`group block pt-[6px] whitespace-nowrap text-slate-700 dark:text-neutral-300 ${className}`}
      >
        <span
          className={`group-hover:bg-primary relative inline-block rounded-full px-3 py-1 align-text-bottom transition-all duration-200 ease-in-out group-hover:text-white`}
        >
          {item.badge && (
            <Badge text={item.badge} top='-top-1' left='left-14' />
          )}
          {name}
          {showIndicator && <Indicator />}
        </span>
      </HoverPrefetchLink>
    )

  return (
    <HoverPrefetchLink
      href={HREF}
      target={item.target}
      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
      className={`link-menu relative mb-1 inline-flex items-center gap-2 font-sans transition-all hover:underline ${small ? 'text-xs text-slate-300' : 'text-sm text-slate-700 dark:text-neutral-300'} ${bgDark ? 'hover:text-slate-100' : ''} ${className}`}
    >
      {item.badge && <Badge text={item.badge} top='-top-2' left='left-20' />}
      {Icon && <Icon size={14} className='opacity-80' />}
      {name}
      {showIndicator && <Indicator />}
    </HoverPrefetchLink>
  )
}

export { MenuLink }
