'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  const { name, href } = item
  const HREF = name === HOME_HREF ? HOME_PATH : href


  if (bottomBar)
    return (
      <Link href={HREF} className='link-bottom-bar hover:text-white'>
        {name}
      </Link>
    )

  if (footer)
    return (
      <li className='list-none'>
        <Link
          href={HREF}
          className='link-footer inline-block pb-3 hover:text-white md:pb-2'
        >
          {categoryName(name, prefix)}
        </Link>
      </li>
    )

  if (main)
    return (
      <Link
        href={HREF}
        className={`block whitespace-nowrap text-slate-700 dark:text-neutral-300 group pt-[6px] ${className}`}
      >
        <span
          className={`inline-block px-3 py-1 align-text-bottom group-hover:bg-primary group-hover:text-white transition-all duration-200 ease-in-out rounded-full`}
        >
          {name}
        </span>
      </Link>
    )

  return (
    <Link
      href={HREF}
      className={`link-menu mb-1 inline-block font-sans hover:underline ${small ? 'text-xs text-slate-300' : 'text-sm text-slate-700 dark:text-neutral-300'} ${bgDark ? 'hover:text-slate-100' : ''}`}
    >
      {name}
    </Link>
  )
}

export { MenuLink }
