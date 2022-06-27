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
}

let activeMenuItem = ''

const MenuLink = ({ name, small, main }: MenuLinkProps) => {
  const router = useRouter()
  const { query, pathname } = router
  const { slug } = query
  if (slug != null) {
    activeMenuItem = slug[0].toLowerCase()
  }

  const BASE_PATH = `${small ? '' : CATEGORY_PATH}/`
  const NORMALIZED_PATH = paramCase(
    name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  )
  const HREF = name === HOME ? HOME_PATH : `${BASE_PATH}${NORMALIZED_PATH}`
  const isActive =
    activeMenuItem === name?.toLowerCase() ||
    (pathname === HOME_PATH && name === HOME) ||
    NORMALIZED_PATH === activeMenuItem

  if (main)
    return (
      <Link href={HREF}>
        <a
          className={`block px-3 -mx-3 text-slate-700 hover:bg-slate-200 hover:text-darkBlue ease-in duration-150 whitespace-nowrap ${
            isActive ? 'hover:bg-white' : ''
          }`}
        >
          <span
            className={`block py-2 md:py-3 ${
              isActive ? 'border-b-2 border-primary' : ''
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
          ${isActive ? 'underline text-primary' : ''}
          `}
        >
          {name}
        </a>
      </Link>
    </span>
  )
}

export { MenuLink }
