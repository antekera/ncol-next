import React from 'react'
import { useEffect } from 'react'

import type { AppProps, NextWebVitalsMetric } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/index.css'
import NProgress from 'nprogress'

// @ts-ignore
const App: React.FC<AppProps> = ({ Component, pageProps, err }) => {
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => {
      NProgress.start()
    }
    const handleComplete = () => {
      NProgress.done()
    }
    const handleStop = () => {
      NProgress.done()
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  return <Component {...pageProps} err={err} />
}

export function reportWebVitals({
  id,
  name,
  label,
  value
}: NextWebVitalsMetric) {
  if (window && window.gtag) {
    window.gtag('event', name, {
      event_category:
        label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true
    })
  }
}

export default App
