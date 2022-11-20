import React from 'react'
import { useEffect } from 'react'

import { AdsProvider } from '@blackbox-vision/next-google-dfp'
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/index.css'
import NProgress from 'nprogress'
import TagManager from 'react-gtm-module'

import { TAG_MANAGER_ID, DFP_ADS } from '@lib/ads'
import { GAPageView, GAEvent, PageEventProps } from '@lib/utils/ga'

const tagManagerArgs = {
  gtmId: TAG_MANAGER_ID
}

interface CustomPageProps {
  pageTitle: string
  pageType: string
}

const App = ({
  Component,
  pageProps,
  err
}: AppProps<CustomPageProps> & { err: any }) => {
  const router = useRouter()

  useEffect(() => {
    TagManager.initialize(tagManagerArgs)
  }, [])

  useEffect(() => {
    const handleRouteChange = (props: PageEventProps) =>
      GAPageView({ ...props })

    const handleStart = () => {
      NProgress.start()
    }

    const handleComplete = (url: string) => {
      NProgress.done()
      const dataLayer = {
        pageTitle: pageProps?.pageTitle,
        pageType: pageProps?.pageType,
        pageUrl: url
      }
      handleRouteChange(dataLayer)
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

  useEffect(() => {
    const dataLayer = {
      pageTitle: pageProps?.pageTitle,
      pageType: pageProps?.pageType,
      pageUrl: 'ENTRY_PAGE'
    }
    GAPageView({ ...dataLayer })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* @ts-ignore */}
      <AdsProvider ads={DFP_ADS} enableLazyload>
        <Component {...pageProps} err={err} />
      </AdsProvider>
    </>
  )
}

export function reportWebVitals({
  id,
  name,
  label,
  value
}: NextWebVitalsMetric) {
  const renderData = {
    action: 'RENDER-METRICS',
    category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    label: id,
    non_interaction: true
  }
  GAEvent({ ...renderData })
}

export default App
