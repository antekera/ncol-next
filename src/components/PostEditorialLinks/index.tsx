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

  return (
    <section
      aria-labelledby='post-editorial-links-title'
      className='mb-8 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-900/60'
    >
      <div className='mb-4'>
        <p className='font-sans text-[11px] font-bold tracking-[0.28em] text-sky-700 uppercase dark:text-sky-300'>
          Descubre más
        </p>
        <h2
          id='post-editorial-links-title'
          className='font-serif text-2xl leading-tight text-slate-950 dark:text-white'
        >
          Sigue explorando esta cobertura
        </h2>
      </div>

      {visibleCategories.length > 0 && (
        <div className='mb-5'>
          <h3 className='mb-2 font-sans text-xs font-bold tracking-[0.2em] text-slate-500 uppercase dark:text-neutral-400'>
            Categorías
          </h3>
          <div className='flex flex-wrap gap-2'>
            {visibleCategories.map(({ node }) => {
              const href = getCategoryHref(node.slug, node.uri)
              if (!href || !node.name) return null

              return (
                <Link
                  key={href}
                  href={href}
                  className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-sky-700 dark:hover:text-sky-300'
                >
                  {node.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {visibleTags.length > 0 && (
        <div className='mb-5'>
          <h3 className='mb-2 font-sans text-xs font-bold tracking-[0.2em] text-slate-500 uppercase dark:text-neutral-400'>
            Temas relacionados
          </h3>
          <div className='flex flex-wrap gap-2'>
            {visibleTags.map(({ node }) => (
              <Link
                key={node.id}
                href={`${TAG_PATH}/${node.slug}`}
                className='rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-sky-100 hover:text-sky-800 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-sky-950 dark:hover:text-sky-300'
              >
                #{node.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className='grid gap-3 md:grid-cols-3'>
        {POST_EDITORIAL_LINKS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='group rounded-2xl border border-slate-200 bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-sky-700'
          >
            <p className='mb-2 font-sans text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase dark:text-neutral-400'>
              {item.eyebrow}
            </p>
            <h3 className='font-sans text-lg font-semibold text-slate-950 transition-colors group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300'>
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

export { PostEditorialLinks }
