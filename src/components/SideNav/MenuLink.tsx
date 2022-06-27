import { paramCase } from 'change-case'
import Link from 'next/link'

import { CATEGORY_PATH, CMS_URL, MENU } from 'lib/constants'

type MenuLinkProps = {
  name: string
  small?: boolean
}

const MenuLink = ({ name, small }: MenuLinkProps) => {
  const BASE_PATH = `${small ? '' : CATEGORY_PATH}/`
  const HREF =
    name === MENU[0] ? `${CMS_URL}` : `${CMS_URL}${BASE_PATH}${paramCase(name)}`

  return (
    <span className='block w-100'>
      <Link href={HREF}>
        <a
          className={`inline-block mb-1 font-sans_light hover:underline  ${
            small ? 'text-xs text-slate-300' : 'text-slate-700'
          }`}
        >
          {name}
        </a>
      </Link>
    </span>
  )
}

export { MenuLink }
