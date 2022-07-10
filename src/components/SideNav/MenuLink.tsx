import { paramCase } from 'change-case'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { CATEGORY_PATH, MENU } from '@lib/constants'
import { categoryName, removeAccents } from '@lib/utils'

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
  bgDark,
}: MenuLinkProps) => {
  const router = useRouter() || { query: { slug: '' }, pathname: '' }
  const { query, pathname } = router
  const { slug } = query

  const ACTIVE_MENU_ITEM = String(slug).toLowerCase()
  const BASE_PATH = `${staticPage ? '' : CATEGORY_PATH}/`
  const NORMALIZED_PATH = paramCase(removeAccents(name))
  const HREF = name === HOME ? HOME_PATH : `${BASE_PATH}${NORMALIZED_PATH}`
  const IS_CURRENT_SLUG = NORMALIZED_PATH === ACTIVE_MENU_ITEM
  const IS_HOME_PATH = pathname === HOME_PATH && name === HOME
  const IS_ACTIVE = IS_HOME_PATH || IS_CURRENT_SLUG

  if (bottomBar)
    return (
      <Link href={HREF}>
        <a className='hover:text-white'>{name}</a>
      </Link>
    )

  if (footer)
    return (
      <li className='list-none'>
        <Link href={HREF}>
          <a className='inline-block pb-3 hover:text-white md:pb-2'>
            {categoryName(name, prefix)}
          </a>
        </Link>
      </li>
    )

  if (main)
    return (
      <Link href={HREF}>
        <a
          className={`block -mx-3 text-slate-700 hover:bg-slate-200 whitespace-nowrap ${
            IS_ACTIVE ? 'hover:bg-white pointer-events-none' : ''
          }`}
        >
          <span
            className={`block px-3 py-2 md:py-3 border-solid border-b-2 hover:border-solid border-slate-200 ${
              IS_ACTIVE
                ? 'border-primary pointer-events-none'
                : 'border-transparent'
            }`}
          >
            {name}
          </span>
        </a>
      </Link>
    )

  return (
    <span className='block w-100'>
      <Link href={HREF}>
        <a
          className={`inline-block mb-1 font-sans hover:underline
          ${small ? 'text-xs text-slate-300' : 'text-slate-700'}
          ${bgDark ? 'hover:text-slate-100' : ''}
          ${IS_ACTIVE ? 'underline text-primary' : ''}
          `}
        >
          {name}
        </a>
      </Link>
    </span>
  )
}

export { MenuLink }
