'use client'

import { kebabCase } from 'change-case-all'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { CATEGORY_PATH, MENU } from '@lib/constants'
import { categoryName, removeAccents } from '@lib/utils'
import { GAEvent } from '@lib/utils/ga'

const HOME = MENU[0]
const HOME_PATH = '/'

type MenuLinkProps = {
  name: string
  small?: boolean
  main?: boolean
  footer?: boolean
  staticPage?: boolean
  bottomBar?: boolean
  prefix?: boolean
  bgDark?: boolean
}

const MenuLink = ({
  name,
  small,
  main,
  footer,
  staticPage,
  bottomBar,
  prefix,
  bgDark
}: MenuLinkProps) => {
  const pathname = usePathname()
  const query = useParams()

  const ACTIVE_MENU_ITEM = String(query.slug).toLowerCase()
  const BASE_PATH = staticPage ? '/' : `${CATEGORY_PATH}/`
  const NORMALIZED_PATH = kebabCase(removeAccents(name))
  const HREF = name === HOME ? HOME_PATH : `${BASE_PATH}${NORMALIZED_PATH}`
  const IS_CURRENT_SLUG = NORMALIZED_PATH === ACTIVE_MENU_ITEM
  const IS_HOME_PATH = pathname === HOME_PATH && name === HOME
  const IS_ACTIVE = IS_HOME_PATH || IS_CURRENT_SLUG

  if (bottomBar)
    return (
      <Link
        href={HREF}
        className='link-bottom-bar hover:text-white'
        onClick={() =>
          GAEvent({
            category: 'MENU_LINK_FOOTER',
            label: 'LINK_BOTTOM_BAR'
          })
        }
      >
        {name}
      </Link>
    )

  if (footer)
    return (
      <li className='list-none'>
        <Link
          href={HREF}
          className='link-footer inline-block pb-3 hover:text-white md:pb-2'
          onClick={() =>
            GAEvent({
              category: 'MENU_LINK_FOOTER',
              label: `LINK_${NORMALIZED_PATH.toUpperCase()}`
            })
          }
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
        onClick={() =>
          GAEvent({
            category: 'MENU_LINK_MAIN',
            label: `LINK_${NORMALIZED_PATH.toUpperCase()}`
          })
        }
      >
        <span
          className={`link-main-menu block border-t-2 border-solid border-slate-200 px-3 py-2 hover:border-solid md:py-3 dark:border-neutral-500 dark:border-transparent ${
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
      onClick={() =>
        GAEvent({
          category: 'MENU_LINK_SIDE',
          label: `LINK_${NORMALIZED_PATH.toUpperCase()}`
        })
      }
    >
      {name}
    </Link>
  )
}

export { MenuLink }
