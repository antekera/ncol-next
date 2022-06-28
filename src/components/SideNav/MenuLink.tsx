import { paramCase } from 'change-case'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { CATEGORY_PATH, MENU } from 'lib/constants'

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
}

const MenuLink = ({
  name,
  small,
  main,
  footer,
  staticPage,
  bottomBar,
  prefix,
}: MenuLinkProps) => {
  const router = useRouter()
  const { query, pathname } = router
  const { slug } = query

  const ACTIVE_MENU_ITEM = String(slug).toLowerCase()
  const BASE_PATH = `${staticPage ? '' : CATEGORY_PATH}/`
  const NORMALIZED_PATH = paramCase(
    name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  )
  const HREF = name === HOME ? HOME_PATH : `${BASE_PATH}${NORMALIZED_PATH}`
  const IS_CURRENT_SLUG = NORMALIZED_PATH === ACTIVE_MENU_ITEM
  const IS_HOME_PATH = pathname === HOME_PATH && name === HOME
  const IS_ACTIVE = IS_HOME_PATH || IS_CURRENT_SLUG

  if (bottomBar)
    return (
      <Link href={HREF}>
        <a className='hover:text-white ease'>{name}</a>
      </Link>
    )

  if (footer)
    return (
      <li className='list-none'>
        <Link href={HREF}>
          <a className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'>
            {prefix && 'Noticias '}
            {name === 'Costa Oriental' && 'de la '}
            {(name === 'Sucesos' ||
              name === 'Economía' ||
              name === 'Salud' ||
              name === 'Curiosidades' ||
              name === 'Tecnología' ||
              name === 'Deportes' ||
              name === 'Política') &&
              'de '}
            {name}
          </a>
        </Link>
      </li>
    )

  if (main)
    return (
      <Link href={HREF}>
        <a
          className={`block -mx-3 text-slate-700 hover:bg-slate-200 ease-in duration-150 whitespace-nowrap ${
            IS_ACTIVE ? 'hover:bg-white pointer-events-none' : ''
          }`}
        >
          <span
            className={`block px-3 py-2 md:py-3 border-b-2 hover:border-slate-200 ease-in duration-150 ${
              IS_ACTIVE
                ? ' border-primary pointer-events-none'
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
          className={`inline-block mb-1 font-sans_light hover:underline
          ${small ? 'text-xs text-slate-300' : 'text-slate-700'}
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
