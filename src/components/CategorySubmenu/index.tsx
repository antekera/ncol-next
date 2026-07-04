import Link from 'next/link'
import { getCategorySubmenuLinks } from '@lib/constants'

type Props = {
  slug: string
}

const CategorySubmenu = ({ slug }: Props) => {
  const links = getCategorySubmenuLinks(slug)

  if (!links.length) return null

  return (
    <nav aria-label='Subcategorías relacionadas' className='mb-6'>
      <div className='flex flex-wrap gap-2'>
        {links.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white'
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export { CategorySubmenu }
