'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { Skeleton } from '@components/ui/skeleton'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { useOpinionAuthors } from '@lib/hooks/data/useOpinionAuthors'

const AuthorSkeleton = () => (
  <li className='flex items-start gap-3'>
    <Skeleton className='size-11 shrink-0 rounded-full' />
    <div className='min-w-0 flex-1 space-y-1.5 pt-0.5'>
      <Skeleton className='h-3.5 w-2/3' />
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-3 w-4/5' />
    </div>
  </li>
)

export function OpinionAuthorsWidget() {
  const { ref, inView } = useInView({ threshold: 0, triggerOnce: true })
  const { authors, isLoading } = useOpinionAuthors()

  const showSkeleton = isLoading || (!inView && authors.length === 0)

  return (
    <section ref={ref} aria-label='Columnistas' className='mb-6 font-sans'>
      <p className='mb-3 border-b border-slate-200 pb-2 text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase dark:border-neutral-700 dark:text-neutral-400'>
        Columnistas
      </p>

      <ul className='space-y-4'>
        {showSkeleton
          ? Array.from({ length: 4 }).map((_, i) => <AuthorSkeleton key={i} />)
          : authors.map(author => (
              <li key={author.slug} className='flex items-start gap-3'>
                <HoverPrefetchLink
                  href={author.uri}
                  className='shrink-0'
                  aria-label={author.name}
                >
                  {author.avatarUrl ? (
                    <Image
                      src={author.avatarUrl}
                      alt={author.name}
                      width={44}
                      height={44}
                      className='size-11 rounded-full object-cover grayscale'
                    />
                  ) : (
                    <span className='flex size-11 items-center justify-center rounded-full bg-slate-200 text-base font-bold text-slate-500 dark:bg-neutral-700 dark:text-neutral-300'>
                      {author.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </HoverPrefetchLink>
                <div className='min-w-0'>
                  <HoverPrefetchLink
                    href={author.uri}
                    className='block text-xs leading-tight font-semibold text-slate-800 hover:underline dark:text-slate-100'
                  >
                    {author.name}
                  </HoverPrefetchLink>
                  <HoverPrefetchLink
                    href={author.latestPost.uri}
                    className='mt-0.5 line-clamp-2 block text-sm leading-snug font-normal text-slate-500 hover:underline dark:text-neutral-400'
                  >
                    {author.latestPost.title}
                  </HoverPrefetchLink>
                </div>
              </li>
            ))}
      </ul>

      <HoverPrefetchLink
        href='/categoria/opinion/'
        className='group mt-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition-all hover:border-sky-300 hover:bg-sky-100 hover:text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400 dark:hover:border-sky-700 dark:hover:bg-sky-900/40 dark:hover:text-sky-300'
      >
        Ver más
        <ArrowRight
          size={13}
          className='transition-transform duration-200 group-hover:translate-x-0.5'
        />
      </HoverPrefetchLink>
    </section>
  )
}
