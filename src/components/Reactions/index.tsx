'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { HttpClient } from '@lib/httpClient'
import { cn } from '@lib/shared'
import {
  REACTIONS,
  emptyReactionCounts,
  isReactionKey,
  type ReactionCounts,
  type ReactionKey
} from '@lib/reactions'

type Props = {
  slug: string
  className?: string
}

const apiClient = new HttpClient()
const STORAGE_PREFIX = 'ncol:reacted:'
// English locale so 2500 → "2.5K" (matches the BuzzFeed-style visual).
// Spanish would render "2,5 mil", which is longer and off-brand for the pill.
const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
})

const storageKey = (slug: string) => `${STORAGE_PREFIX}${slug}`

const readStoredReaction = (slug: string): ReactionKey | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(slug))
    return isReactionKey(raw) ? raw : null
  } catch {
    return null
  }
}

const writeStoredReaction = (slug: string, reaction: ReactionKey) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(slug), reaction)
  } catch {
    // Silent — private-mode / quota errors shouldn't break voting.
  }
}

export const Reactions = ({ slug, className }: Props) => {
  const [counts, setCounts] = useState<ReactionCounts>(emptyReactionCounts)
  const [selected, setSelected] = useState<ReactionKey | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setSelected(readStoredReaction(slug))

    let cancelled = false
    void (async () => {
      try {
        const { data } = await apiClient.get<{ counts: ReactionCounts }>(
          `/api/reactions/?slug=${encodeURIComponent(slug)}`,
          { revalidate: 0 }
        )
        if (!cancelled && data?.counts) {
          setCounts({ ...emptyReactionCounts(), ...data.counts })
        }
      } catch (err) {
        Sentry.captureException(err)
      } finally {
        if (!cancelled) setIsLoaded(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slug])

  const handleVote = useCallback(
    async (reaction: ReactionKey) => {
      if (isSubmitting) return
      if (selected === reaction) return

      const prev = selected
      const previousCounts = counts
      const optimistic: ReactionCounts = { ...counts }
      // Safe: `reaction`/`prev` are ReactionKey literals from a fixed union.

      optimistic[reaction] = (optimistic[reaction] ?? 0) + 1
      if (prev) optimistic[prev] = Math.max((optimistic[prev] ?? 0) - 1, 0)

      setCounts(optimistic)
      setSelected(reaction)
      setIsSubmitting(true)

      try {
        const { data } = await apiClient.post<{ counts: ReactionCounts }>(
          '/api/reactions/',
          { slug, reaction, prev: prev ?? undefined }
        )
        if (data?.counts) {
          setCounts({ ...emptyReactionCounts(), ...data.counts })
        }
        writeStoredReaction(slug, reaction)
      } catch (err) {
        Sentry.captureException(err)
        // Revert optimistic UI on failure.
        setCounts(previousCounts)
        setSelected(prev)
      } finally {
        setIsSubmitting(false)
      }
    },
    [counts, isSubmitting, selected, slug]
  )

  const items = useMemo(
    () =>
      REACTIONS.map(r => ({
        ...r,
        count: counts[r.key] ?? 0,
        isSelected: selected === r.key
      })),
    [counts, selected]
  )

  return (
    <section
      aria-labelledby='reactions-heading'
      className={cn('my-8 w-full', className)}
    >
      <div className='mb-4 flex justify-center' aria-hidden='true'>
        <svg
          width='60'
          height='16'
          viewBox='0 0 60 16'
          fill='none'
          className='text-indigo-500'
        >
          <path
            d='M2 8 Q 9.5 -2, 17 8 T 32 8 T 47 8 T 62 8'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
            fill='none'
          />
        </svg>
      </div>

      <h2
        id='reactions-heading'
        className='mb-6 flex items-center gap-3 font-serif text-3xl font-bold text-slate-800 dark:text-neutral-100'
      >
        <MessageSquare className='h-7 w-7' aria-hidden='true' />
        Comentarios
      </h2>

      <ul
        className='flex flex-wrap items-start gap-3 sm:gap-4'
        role='radiogroup'
        aria-label='¿Cómo te hizo sentir esta noticia?'
      >
        {items.map(({ key, emoji, label, count, isSelected }) => (
          <li key={key} className='relative'>
            <button
              type='button'
              role='radio'
              aria-checked={isSelected}
              aria-label={`${label} (${count})`}
              disabled={isSubmitting && !isSelected}
              onClick={() => void handleVote(key)}
              className={cn(
                'group relative flex h-14 w-14 items-center justify-center rounded-full',
                'bg-white text-2xl shadow-md ring-1 ring-slate-200',
                'transition-transform duration-150 ease-out',
                'hover:-translate-y-0.5 hover:shadow-lg',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                'disabled:cursor-not-allowed',
                'dark:bg-neutral-800 dark:ring-neutral-700',
                isSelected && 'ring-2 ring-indigo-500 dark:ring-indigo-400'
              )}
            >
              <span aria-hidden='true'>{emoji}</span>
            </button>
            {isLoaded && count > 0 && (
              <span
                aria-hidden='true'
                className='pointer-events-none absolute -top-2 left-full -ml-1 rounded-full bg-lime-200 px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-lime-300 dark:text-slate-900'
              >
                {compact.format(count)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
