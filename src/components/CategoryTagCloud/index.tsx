import Link from 'next/link'
import { seoStaticData } from '@lib/generated/seoStaticData'

type Props = {
  slug: string
  title?: string
}

const CategoryTagCloud = ({ slug, title }: Props) => {
  // eslint-disable-next-line security/detect-object-injection
  const categoryTags = seoStaticData.categoryTags[slug]
  const tags = categoryTags?.length ? categoryTags : seoStaticData.popularTags
  const resolvedTitle =
    title ?? (categoryTags?.length ? 'Temas de interés' : 'Temas de interés')

  if (!tags?.length) return null

  return (
    <section aria-labelledby='category-tag-cloud-title' className='py-4'>
      <h2
        id='category-tag-cloud-title'
        className='mb-3 font-sans text-xs font-bold tracking-[0.22em] text-slate-500 uppercase dark:text-neutral-400'
      >
        {resolvedTitle}
      </h2>
      <div className='flex flex-wrap gap-1.5'>
        {tags.map(tag => (
          <Link
            key={tag.href}
            href={tag.href}
            className='rounded border border-slate-200 px-2 py-0.5 font-sans text-[11px] font-medium text-slate-600 transition-colors hover:[border-color:var(--color-dark-blue)] hover:[color:var(--color-dark-blue)] dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-neutral-200'
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

export { CategoryTagCloud }
