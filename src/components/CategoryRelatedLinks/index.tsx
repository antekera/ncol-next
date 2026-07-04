import Link from 'next/link'
import { getCategoryRelatedLinks } from '@lib/constants'

type Props = {
  slug: string
}

const CategoryRelatedLinks = ({ slug }: Props) => {
  const links = getCategoryRelatedLinks(slug)

  if (!links.length) return null

  return (
    <section aria-labelledby='category-related-links-title' className='mb-6'>
      <h2
        id='category-related-links-title'
        className='mb-3 font-sans text-xs font-bold tracking-[0.2em] text-slate-500 uppercase dark:text-neutral-400'
      >
        Lecturas y secciones afines
      </h2>
      <div className='grid gap-3 md:grid-cols-2'>
        {links.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-950'
          >
            <p className='mb-2 font-sans text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase dark:text-neutral-400'>
              {item.eyebrow}
            </p>
            <h3 className='font-sans text-base font-semibold text-slate-950 dark:text-white'>
              {item.name}
            </h3>
            <p className='mt-2 text-sm leading-6 text-slate-600 dark:text-neutral-300'>
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { CategoryRelatedLinks }
