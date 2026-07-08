import Link from 'next/link'
import { seoStaticData } from '@lib/generated/seoStaticData'

type Props = {
  slug: string
  title?: string
}

const getStaticCategoryTags = (slug: string) => {
  return seoStaticData.categoryTags[slug] ?? null
}

const CategoryTagCloud = ({ slug, title = 'Temas relacionados' }: Props) => {
  const tags = getStaticCategoryTags(slug)

  if (!tags || !tags.length) return null

  return (
    <section
      aria-labelledby='category-tag-cloud-title'
      className='border-t-4 [border-top-color:var(--color-dark-blue)] bg-white py-4 dark:bg-neutral-950'
    >
      <h2
        id='category-tag-cloud-title'
        className='mb-3 font-sans text-xs font-bold tracking-[0.22em] text-slate-500 uppercase dark:text-neutral-400'
      >
        {title}
      </h2>
      <div className='flex flex-wrap gap-1.5'>
        {tags.map(tag => (
          <Link
            key={tag.href}
            href={tag.href}
            className='rounded border border-slate-200 px-2.5 py-1 font-sans text-[11px] font-medium text-slate-600 transition-colors hover:[border-color:var(--color-dark-blue)] hover:[color:var(--color-dark-blue)] dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-neutral-200'
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

export { CategoryTagCloud }
