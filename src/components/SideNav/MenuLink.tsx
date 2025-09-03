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
}

const MenuLink = ({
  item,
  small,
  main,
  footer,
  bottomBar,
  prefix,
  bgDark
}: MenuLinkProps) => {
  const pathname = usePathname()

  const { name, href } = item
  const HREF = name === HOME_HREF ? HOME_PATH : href
  const IS_CURRENT_SLUG = `${HREF}/` === pathname
  const IS_HOME_PATH = pathname === HOME_PATH && href === HOME_HREF
  const IS_ACTIVE = IS_HOME_PATH || IS_CURRENT_SLUG

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
        className={`link-main-menu block whitespace-nowrap text-slate-700 hover:bg-slate-200 dark:text-neutral-300 dark:hover:bg-slate-800 dark:hover:text-white ${
          IS_ACTIVE
            ? 'pointer-events-none hover:bg-white dark:bg-neutral-800 dark:hover:bg-slate-800'
            : ''
        }`}
      >
        <span
          className={`link-main-menu block border-t-2 border-solid border-slate-200 px-3 py-2 hover:border-solid md:py-3 dark:border-transparent ${
            IS_ACTIVE
              ? 'border-primary pointer-events-none dark:text-white'
              : 'border-transparent'
          }`}
        >
          {name}
        </span>
      </Link>
    )

  return (
    <Link
      href={HREF}
      className={`link-menu mb-1 inline-block font-sans hover:underline ${small ? 'text-xs text-slate-300' : 'text-sm text-slate-700 dark:text-neutral-300'} ${bgDark ? 'hover:text-slate-100' : ''} ${IS_ACTIVE ? 'text-secondary pointer-events-none underline' : ''} `}
    >
      {name}
    </Link>
  )
}

export { MenuLink }
