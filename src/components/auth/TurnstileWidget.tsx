'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
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
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    if (scriptReady && window.turnstile && widgetRef.current) {
      window.turnstile.render(widgetRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!
      })
    }
  }, [scriptReady])

  if (!isProd) return null

  return (
    <>
      <div
        ref={widgetRef}
        className='cf-turnstile flex justify-center'
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      />
      <Script
        id='cf-turnstile-sdk'
        src='https://challenges.cloudflare.com/turnstile/v0/api.js'
        strategy='afterInteractive'
        onReady={() => setScriptReady(true)}
      />
    </>
  )
}

export async function verifyTurnstileToken(): Promise<boolean> {
  const token = window.turnstile?.getResponse()
  if (!token) return false

  const res = await fetch('/api/auth/verify-turnstile/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  })
  const { verified } = await res.json()
  return Boolean(verified)
}
