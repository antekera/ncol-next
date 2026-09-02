'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from 'react'
import { MessageSquare } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { reactionsClient } from '@lib/api'
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
  postDate?: string
  className?: string
}

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

const findReactionIndex = (key: ReactionKey | null): number => {
  if (!key) return 0
  const idx = REACTIONS.findIndex(r => r.key === key)
  return idx >= 0 ? idx : 0
}

export const Reactions = ({ slug, postDate, className }: Props) => {
  const [counts, setCounts] = useState<ReactionCounts>(emptyReactionCounts)
  const [selected, setSelected] = useState<ReactionKey | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  // Roving tabindex — only one button in the radiogroup is tabbable at
  // a time. Arrow/Home/End move focus; nothing auto-focuses on mount.
  const [focusedIndex, setFocusedIndex] = useState(0)
  // Screen-reader announcement after a vote resolves (or fails).
  const [statusMessage, setStatusMessage] = useState('')
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    const stored = readStoredReaction(slug)
    setSelected(stored)
    // Park the roving tabindex on the user's current vote so Tab lands
    // there directly. Never call .focus() here — would steal focus on mount.
    setFocusedIndex(findReactionIndex(stored))

    let cancelled = false
    void (async () => {
      try {
        const counts = await reactionsClient.getCounts(slug)
        if (!cancelled) {
          setCounts({ ...emptyReactionCounts(), ...counts })
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

  const focusIndex = useCallback((index: number) => {
    setFocusedIndex(index)
    // eslint-disable-next-line security/detect-object-injection
    buttonRefs.current[index]?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLUListElement>) => {
      const last = REACTIONS.length - 1
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          focusIndex(focusedIndex === last ? 0 : focusedIndex + 1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          focusIndex(focusedIndex === 0 ? last : focusedIndex - 1)
          break
        case 'Home':
          event.preventDefault()
          focusIndex(0)
          break
        case 'End':
          event.preventDefault()
          focusIndex(last)
          break
      }
    },
    [focusedIndex, focusIndex]
  )

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

      const meta = REACTIONS.find(r => r.key === reaction)

      setCounts(optimistic)
      setSelected(reaction)
      setIsSubmitting(true)

      try {
        const nextCounts = await reactionsClient.vote({
          slug,
          reaction,
          prev: prev ?? undefined,
          postDate: postDate ?? undefined
        })
        setCounts({ ...emptyReactionCounts(), ...nextCounts })
        writeStoredReaction(slug, reaction)
        setStatusMessage(`Reacción "${meta?.label ?? reaction}" registrada.`)
      } catch (err) {
        Sentry.captureException(err)
        // Revert optimistic UI on failure — reactionsClient throws on any
        // network/HTTP error, so we know the DB was not updated.
        setCounts(previousCounts)
        setSelected(prev)
        setStatusMessage('No se pudo registrar tu reacción. Intenta de nuevo.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [counts, isSubmitting, selected, slug, postDate]
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
        aria-busy={isSubmitting}
        onKeyDown={handleKeyDown}
      >
        {items.map(({ key, emoji, label, count, isSelected }, i) => (
          <li key={key} className='relative'>
            <button
              type='button'
              role='radio'
              aria-checked={isSelected}
              aria-label={`${label} (${count})`}
              tabIndex={i === focusedIndex ? 0 : -1}
              disabled={isSubmitting && !isSelected}
              onClick={() => void handleVote(key)}
              ref={el => {
                // eslint-disable-next-line security/detect-object-injection
                buttonRefs.current[i] = el
              }}
              className={cn(
                'group relative flex h-14 w-14 items-center justify-center rounded-full',
                'bg-white text-2xl shadow-md ring-1 ring-slate-200',
                'transition-transform duration-150 ease-out',
                'hover:shadow-lg motion-safe:hover:-translate-y-0.5',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
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

      <div
        role='status'
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
      >
        {statusMessage}
      </div>
    </section>
  )
}
