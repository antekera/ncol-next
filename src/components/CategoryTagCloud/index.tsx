import Link from 'next/link'
import { seoStaticData } from '@lib/generated/seoStaticData'

type Props = {
  slug: string
  title?: string
}

const getStaticCategoryTags = (slug: string) => {
  return seoStaticData.categoryTags[slug] ?? null
}

const CategoryTagCloud = ({
  slug,
  title = 'Etiquetas relacionadas'
}: Props) => {
  const tags = getStaticCategoryTags(slug)

  if (!tags || !tags.length) return null

  return (
    <section
      aria-labelledby='category-tag-cloud-title'
      className='mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900'
    >
      <h2
        id='category-tag-cloud-title'
        className='mb-3 font-sans text-xs font-bold tracking-[0.2em] text-slate-500 uppercase dark:text-neutral-400'
      >
        {title}
      </h2>
      <div className='flex flex-wrap gap-2'>
        {tags.map(tag => (
          <Link
            key={tag.href}
            href={tag.href}
            className='hover:bg-primary dark:hover:bg-primary rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:text-white dark:bg-neutral-800 dark:text-neutral-300'
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

export { CategoryTagCloud }
