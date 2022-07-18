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
    const handleStop = () => {
      NProgress.done()
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  return <Component {...pageProps} err={err} />
}

export function reportWebVitals({
  id,
  name,
  value,
  startTime
}: NextWebVitalsMetric) {
  // eslint-disable-next-line no-console
  console.log(`${name}: `, id, value, startTime) // The metric object ({ id, name, startTime, value, label }) is logged to the console
}

export default App
