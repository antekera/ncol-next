import Link from 'next/link'
import { seoStaticData } from '@lib/generated/seoStaticData'

type Props = {
  title?: string
  className?: string
}

const TagCloud = ({ title = 'Etiquetas destacadas', className }: Props) => {
  const tags = seoStaticData.popularTags

  if (!tags.length) return null

  return (
    <section className={className} aria-labelledby='tag-cloud-title'>
      <h2
        id='tag-cloud-title'
        className='mb-3 border-b border-slate-200 pb-2 font-sans text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase'
      >
        {title}
      </h2>
      <div className='flex flex-wrap gap-1.5'>
        {tags.map(tag => (
          <Link
            key={tag.href}
            href={tag.href}
            className='rounded border border-slate-200 px-2.5 py-1 font-sans text-sm font-medium text-slate-600 transition-colors hover:[border-color:var(--color-dark-blue)] hover:[color:var(--color-dark-blue)] dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-neutral-200'
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

export { TagCloud }
