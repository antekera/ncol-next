'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, BellRing, Loader2 } from 'lucide-react'
import { cn } from '@lib/shared'
import { useLoginModal } from '@components/auth/LoginModalContext'
import { requestOneSignalPermission } from '@lib/oneSignalWeb'
import { createClient } from '@lib/supabase/client'

type Props = {
  tagSlug: string
  tagName: string
  variant: 'icon' | 'banner'
  className?: string
}

type SubscriptionState = 'unknown' | 'subscribed' | 'unsubscribed'

// Persists which tag the reader was trying to follow when they were
// prompted to log in. A same-page email/password login can finish the
// subscribe via an in-memory callback, but Google sign-in does a full
// page redirect that destroys any in-memory state — sessionStorage
// survives that round trip, so this key is what actually completes the
// subscription once the reader lands back here authenticated.
const PENDING_TAG_KEY = 'ncol_pending_tag_subscribe'

async function fetchStatus(tagSlug: string): Promise<SubscriptionState> {
  try {
    const res = await fetch(
      `/api/tags/subscription/?tagSlug=${encodeURIComponent(tagSlug)}`
    )
    if (res.status === 401) return 'unsubscribed'
    if (!res.ok) return 'unknown'
    const data = await res.json()
    return data.subscribed ? 'subscribed' : 'unsubscribed'
  } catch {
    return 'unknown'
  }
}

async function setSubscription(
  tagSlug: string,
  subscribe: boolean
): Promise<boolean> {
  const res = await fetch('/api/tags/subscription/', {
    method: subscribe ? 'POST' : 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagSlug })
  })
  return res.ok
}

function useTagSubscription(tagSlug: string) {
  const { openLoginModal } = useLoginModal()
  const [status, setStatus] = useState<SubscriptionState>('unknown')
  const [isPending, setIsPending] = useState(false)

  // getSession() reads the session from local storage/cookies — no
  // network round trip — so logged-out visitors (the vast majority)
  // never hit the API just to learn what they already know: nothing.
  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (!data.session) {
        setStatus('unsubscribed')
        return
      }
      void fetchStatus(tagSlug).then(result => {
        if (!cancelled) setStatus(result)
      })
    })
    return () => {
      cancelled = true
    }
  }, [tagSlug])

  // Confirming a subscribe is the one moment we ask the browser for push
  // permission — never on page load for every visitor.
  const confirmSubscribed = useCallback((ok: boolean) => {
    if (!ok) return
    setStatus('subscribed')
    requestOneSignalPermission()
  }, [])

  // Resumes a subscription that was interrupted by a Google OAuth redirect:
  // this tag's button remounts on the same page after the reader comes
  // back authenticated, and completes the subscribe it recorded before
  // sending them to Google.
  useEffect(() => {
    if (sessionStorage.getItem(PENDING_TAG_KEY) !== tagSlug) return
    sessionStorage.removeItem(PENDING_TAG_KEY)
    void setSubscription(tagSlug, true).then(confirmSubscribed)
  }, [tagSlug, confirmSubscribed])

  const toggleSubscription = useCallback(async () => {
    const nextSubscribed = status !== 'subscribed'
    setIsPending(true)

    const res = await fetch('/api/tags/subscription/', {
      method: nextSubscribed ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagSlug })
    })

    if (res.status === 401) {
      setIsPending(false)
      sessionStorage.setItem(PENDING_TAG_KEY, tagSlug)
      openLoginModal(() => {
        sessionStorage.removeItem(PENDING_TAG_KEY)
        return setSubscription(tagSlug, true).then(confirmSubscribed)
      })
      return
    }

    setIsPending(false)
    if (res.ok) {
      if (nextSubscribed) {
        confirmSubscribed(true)
      } else {
        setStatus('unsubscribed')
      }
    }
  }, [status, tagSlug, openLoginModal, confirmSubscribed])

  return {
    isSubscribed: status === 'subscribed',
    isPending,
    toggleSubscription
  }
}

function BannerVariant({
  tagName,
  isSubscribed,
  isPending,
  onToggle,
  className
}: {
  tagName: string
  isSubscribed: boolean
  isPending: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <button
      type='button'
      onClick={onToggle}
      disabled={isPending}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:border-[var(--color-dark-blue)] dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      <span className='flex items-center gap-3'>
        {isSubscribed ? (
          <BellRing className='h-5 w-5 shrink-0 text-[var(--color-dark-blue)]' />
        ) : (
          <Bell className='h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400' />
        )}
        <span className='text-sm font-medium text-slate-700 dark:text-neutral-200'>
          {isSubscribed
            ? `Ya recibirás alertas de #${tagName}`
            : `Suscríbete a #${tagName} y te avisamos cuando haya una nueva publicación`}
        </span>
      </span>
      {isPending ? (
        <Loader2 className='h-4 w-4 shrink-0 animate-spin text-slate-400' />
      ) : (
        <span className='shrink-0 text-xs font-semibold text-[var(--color-dark-blue)]'>
          {isSubscribed ? 'Suscrito' : 'Suscribirme'}
        </span>
      )}
    </button>
  )
}

function IconVariant({
  tagName,
  isSubscribed,
  isPending,
  onToggle,
  className
}: {
  tagName: string
  isSubscribed: boolean
  isPending: boolean
  onToggle: () => void
  className?: string
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!showConfirm) return
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowConfirm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showConfirm])

  const confirmMessage = isSubscribed
    ? `¿Dejar de recibir alertas de #${tagName}?`
    : `¿Suscribirte a #${tagName} y recibir una alerta cada vez que se publique algo con este tag?`

  return (
    <span ref={containerRef} className='relative inline-flex'>
      <button
        type='button'
        data-onboarding-target='tag-subscribe'
        aria-label={
          isSubscribed
            ? `Dejar de recibir alertas de ${tagName}`
            : `Suscribirte a ${tagName}`
        }
        onClick={() => setShowConfirm(v => !v)}
        disabled={isPending}
        className={cn(
          'flex items-center text-slate-400 transition-colors hover:text-[var(--color-dark-blue)]',
          isSubscribed && 'text-[var(--color-dark-blue)]',
          className
        )}
      >
        {isSubscribed ? (
          <BellRing className='h-3.5 w-3.5' />
        ) : (
          <Bell className='h-3.5 w-3.5' />
        )}
      </button>

      {showConfirm && (
        <div className='absolute top-full left-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800'>
          <p className='mb-3 text-xs leading-5 text-slate-600 dark:text-neutral-300'>
            {confirmMessage}
          </p>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={() => setShowConfirm(false)}
              className='rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-700'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={() => {
                setShowConfirm(false)
                onToggle()
              }}
              className='rounded bg-[var(--color-dark-blue)] px-2 py-1 text-xs font-semibold text-white hover:opacity-90'
            >
              {isSubscribed ? 'Dejar de seguir' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </span>
  )
}

export function TagSubscribeButton({
  tagSlug,
  tagName,
  variant,
  className
}: Props) {
  const { isSubscribed, isPending, toggleSubscription } =
    useTagSubscription(tagSlug)

  const onToggle = () => {
    void toggleSubscription()
  }

  if (variant === 'banner') {
    return (
      <BannerVariant
        tagName={tagName}
        isSubscribed={isSubscribed}
        isPending={isPending}
        onToggle={onToggle}
        className={className}
      />
    )
  }

  return (
    <IconVariant
      tagName={tagName}
      isSubscribed={isSubscribed}
      isPending={isPending}
      onToggle={onToggle}
      className={className}
    />
  )
}
