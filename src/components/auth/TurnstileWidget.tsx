'use client'

import { useEffect, useRef, useState } from 'react'
import { isProd } from '@lib/utils/env'

declare global {
  interface Window {
    turnstile?: {
      reset(widget: HTMLElement): unknown
      getResponse: () => string
      render: (el: HTMLElement, opts: { sitekey: string }) => void
    }
  }
}

export function TurnstileWidget() {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && window.turnstile && widgetRef.current) {
      window.turnstile.render(widgetRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!
      })
    }
  }, [mounted])

  if (!isProd) return null
  if (!mounted) return null

  return (
    <>
      <div
        ref={widgetRef}
        className='cf-turnstile flex justify-center'
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      />
      <script
        src='https://challenges.cloudflare.com/turnstile/v0/api.js'
        async
        defer
      />
    </>
  )
}

export async function verifyTurnstileToken(): Promise<boolean> {
  const token = window.turnstile?.getResponse()
  if (!token) return false

  const res = await fetch('/api/auth/verify-turnstile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  })
  const { verified } = await res.json()
  return Boolean(verified)
}
