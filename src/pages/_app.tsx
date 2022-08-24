import React from 'react'
import { useEffect } from 'react'

import type { AppProps, NextWebVitalsMetric } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/index.css'
import NProgress from 'nprogress'
import TagManager from 'react-gtm-module'

import { TAG_MANAGER_ID } from '@lib/constants'
import { GTMPageView, PageEventProps } from '@lib/utils/gtm'

const tagManagerArgs = {
  gtmId: TAG_MANAGER_ID
}

// @ts-ignore
const App: React.FC<AppProps> = ({ Component, pageProps, err }) => {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      TagManager.initialize(tagManagerArgs)

      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})

      // @ts-ignore
      window._taboola = window._taboola || []

      // @ts-ignore
      window._taboola.push({
        mode: 'thumbnails-a',
        container: 'taboola-below-article-thumbnails',
        placement: 'Below Article Thumbnails',
        target_type: 'mix'
      })
    }
  }, [])

  useEffect(() => {
    const handleRouteChange = (props: PageEventProps) =>
      GTMPageView({ ...props })

    const handleStart = () => {
      NProgress.start()
    }

    const handleComplete = (url: string) => {
      NProgress.done()
      const mainDataLayer = {
        pageTitle: pageProps?.pageTitle,
        pageType: pageProps?.pageType,
        pageUrl: url
      }
      handleRouteChange(mainDataLayer)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return <Component {...pageProps} err={err} />
}

export function reportWebVitals({
  id,
  name,
  label,
  value
}: NextWebVitalsMetric) {
  if (window?.gtag) {
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
