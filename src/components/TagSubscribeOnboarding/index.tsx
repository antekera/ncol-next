'use client'

import { useEffect, useState } from 'react'
import { useLoginModal } from '@components/auth/LoginModalContext'

const STORAGE_KEY = 'ncol_onboarding_tag_subscribe_seen'

type Rect = { top: number; left: number; width: number; height: number }

type Step = {
  target: string
  title: string
  description: string
  cta: string
}

const STEPS: Step[] = [
  {
    target: 'tag-subscribe',
    title: 'Suscríbete a un tema',
    description:
      'Toca la campana junto a cualquier tag para recibir una alerta cada vez que publiquemos algo nuevo sobre ese tema.',
    cta: 'Siguiente'
  },
  {
    target: 'login-icon',
    title: 'Inicia sesión para activarlo',
    description:
      'Necesitas una cuenta para recibir las notificaciones. Inicia sesión aquí cuando quieras.',
    cta: 'Entendido'
  }
]

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector<HTMLElement>(
    `[data-onboarding-target="${target}"]`
  )
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

export function TagSubscribeOnboarding() {
  const { openLoginModal } = useLoginModal()
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    // Kill switch for the tour without a code change — set
    // NEXT_PUBLIC_TAG_SUBSCRIBE_ONBOARDING_ENABLED=true to turn it back on.
    // Defaults to off. Read at effect time (not module scope) so it can be
    // toggled per test without reloading the module.
    if (process.env.NEXT_PUBLIC_TAG_SUBSCRIBE_ONBOARDING_ENABLED !== 'true') {
      return
    }
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return

    const tagTarget = document.querySelector<HTMLElement>(
      '[data-onboarding-target="tag-subscribe"]'
    )
    const hasLoginTarget = document.querySelector(
      '[data-onboarding-target="login-icon"]'
    )
    if (!tagTarget || !hasLoginTarget) return

    // Only start the tour once the tag bell reaches the middle of the
    // viewport — it usually sits near the bottom of the post, and
    // triggering as soon as it merely scrolls into view lands the tour
    // tooltip right where the sticky footer ad and WhatsApp popup live.
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect()
          setStepIndex(0)
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    )
    observer.observe(tagTarget)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (stepIndex === null) return
    const step = STEPS.at(stepIndex)
    if (!step) return
    setRect(getTargetRect(step.target))

    const handleReposition = () => setRect(getTargetRect(step.target))
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)
    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [stepIndex])

  const finish = (thenOpenLogin: boolean) => {
    localStorage.setItem(STORAGE_KEY, '1')
    setStepIndex(null)
    if (thenOpenLogin) openLoginModal()
  }

  if (stepIndex === null) return null

  const step = STEPS.at(stepIndex)

  if (!step || !rect) return null

  const isLastStep = stepIndex === STEPS.length - 1
  const padding = 6

  return (
    <div className='fixed inset-0 z-[60]'>
      <div
        className='absolute rounded-md transition-all duration-300'
        style={{
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.7)'
        }}
      />
      <div
        className='absolute w-64 rounded-lg bg-white p-4 shadow-xl dark:bg-neutral-800'
        style={{
          top: Math.min(
            rect.top + rect.height + padding + 12,
            window.innerHeight - 180
          ),
          left: Math.min(
            Math.max(rect.left - 80, 12),
            window.innerWidth - 272
          )
        }}
      >
        <p className='mb-1 text-sm font-bold text-slate-800 dark:text-white'>
          {step.title}
        </p>
        <p className='mb-3 text-xs leading-5 text-slate-600 dark:text-neutral-300'>
          {step.description}
        </p>
        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={() => finish(false)}
            className='text-xs text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200'
          >
            Omitir
          </button>
          <button
            type='button'
            onClick={() =>
              isLastStep ? finish(true) : setStepIndex(stepIndex + 1)
            }
            className='rounded bg-[var(--color-dark-blue)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90'
          >
            {step.cta}
          </button>
        </div>
      </div>
    </div>
  )
}
