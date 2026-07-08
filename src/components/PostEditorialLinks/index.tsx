import Link from 'next/link'
import { CATEGORY_PATH, POST_EDITORIAL_LINKS, TAG_PATH } from '@lib/constants'
import type { Categories, Post } from '@lib/types'

type Props = {
  categories?: Categories
  tags?: Post['tags']
}

const getCategoryHref = (slug?: string, uri?: string) => {
  if (uri) return uri
  if (!slug) return undefined
  return `${CATEGORY_PATH}/${slug}`
}

const PostEditorialLinks = ({ categories, tags }: Props) => {
  const visibleCategories =
    categories?.edges
      ?.filter(({ node }) => node.slug && !node.slug.startsWith('_'))
      .slice(0, 3) ?? []

  const visibleTags = tags?.edges?.slice(0, 6) ?? []

  const hasChips = visibleCategories.length > 0 || visibleTags.length > 0

  return (
    <section
      aria-label='Sigue explorando esta cobertura'
      className='mb-6 border-t-4 [border-top-color:var(--color-dark-blue)] bg-white dark:bg-neutral-950'
    >
      <div className='border-b border-slate-200 px-4 py-2 dark:border-neutral-700'>
        <p className='font-sans text-[10px] font-bold tracking-[0.22em] text-slate-500 uppercase dark:text-neutral-400'>
          Sigue explorando
        </p>
      </div>

      {hasChips && (
        <div className='flex flex-wrap gap-1.5 border-b border-slate-100 px-4 py-3 dark:border-neutral-800'>
          {visibleCategories.map(({ node }) => {
            const href = getCategoryHref(node.slug, node.uri)
            if (!href || !node.name) return null
            return (
              <Link
                key={href}
                href={href}
                className='rounded border border-slate-200 px-2.5 py-0.5 font-sans text-[11px] font-semibold text-slate-600 transition-colors hover:[border-color:var(--color-dark-blue)] hover:[color:var(--color-dark-blue)] dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-neutral-200'
              >
                {node.name}
              </Link>
            )
          })}
          {visibleTags.map(({ node }) => (
            <Link
              key={node.id}
              href={`${TAG_PATH}/${node.slug}`}
              className='rounded border border-slate-200 px-2.5 py-0.5 font-sans text-[11px] font-medium text-slate-500 transition-colors hover:[border-color:var(--color-dark-blue)] hover:[color:var(--color-dark-blue)] dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-neutral-200'
            >
              {node.name}
            </Link>
          ))}
        </div>
      )}

      <div className='divide-y divide-slate-100 dark:divide-neutral-800'>
        {POST_EDITORIAL_LINKS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900'
          >
            <div>
              <p className='mb-0.5 font-sans text-[9px] font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-neutral-500'>
                {item.eyebrow}
              </p>
              <span className='font-sans text-sm font-semibold text-slate-900 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2 dark:text-white'>
                {item.name}
              </span>
              <span className='sr-only'> — {item.description}</span>
            </div>
            <span className='shrink-0 font-sans text-lg leading-none font-thin text-slate-300 dark:text-neutral-600'>
              &rsaquo;
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { PostEditorialLinks }
