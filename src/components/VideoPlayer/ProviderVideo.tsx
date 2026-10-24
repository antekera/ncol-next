'use client'

import { useEffect, useRef, type RefObject } from 'react'
import {
  isHomeMediaMeasured,
  reportVideoPlay,
  type VideoProvider
} from '@lib/homeV2/mediaBridge'

/** React owns the host; the provider owns its iframe and may destroy it safely. */
export function ProviderVideo({
  embed,
  title,
  provider,
  videoId,
  mode = 'activated',
  iframeRef
}: {
  embed: string
  title: string
  provider: VideoProvider
  videoId: string
  mode?: 'activated' | 'embedded-home'
  iframeRef?: RefObject<HTMLIFrameElement | null>
}) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = host.current
    if (!container) return
    const measured = isHomeMediaMeasured(container)
    const api =
      (measured || mode === 'embedded-home') &&
      provider === 'youtube' &&
      /^[a-zA-Z0-9_-]{6,64}$/.test(videoId)
    const source = new URL(embed)
    if (mode === 'activated') source.searchParams.set('autoplay', '1')
    if (api) {
      source.searchParams.set('enablejsapi', '1')
      source.searchParams.set('origin', window.location.origin)
    }
    const frame = document.createElement('iframe')
    frame.title = title
    frame.src = source.href
    frame.allow =
      mode === 'embedded-home'
        ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        : 'autoplay; encrypted-media; picture-in-picture'
    if (mode === 'embedded-home')
      frame.className = 'absolute inset-0 h-full w-full'
    frame.allowFullscreen = true
    const nativeMeasurement = measured ? 'unsupported-provider' : 'off'
    const apiMeasurement =
      mode === 'embedded-home' ? 'awaiting-visibility' : 'pending-provider'
    frame.dataset.videoMeasurement = api ? apiMeasurement : nativeMeasurement
    container.append(frame)
    if (iframeRef) iframeRef.current = frame
    let stopped = false
    let observing = false
    let stop = () => {}
    let stopVisibility = () => {}
    const confirmed = () => {
      if (stopped) return
      frame.dataset.videoMeasurement = 'confirmed'
      reportVideoPlay(frame, provider, videoId)
    }
    const start = () => {
      if (stopped || observing || !api || !isHomeMediaMeasured(container))
        return
      observing = true
      stopVisibility()
      frame.dataset.videoMeasurement = 'pending-provider'
      void import('@lib/homeV2/youtubePlayback')
        .then(({ observeYoutubePlayback }) => {
          if (stopped) return
          if (!isHomeMediaMeasured(container)) {
            observing = false
            return
          }
          stop = observeYoutubePlayback(frame, confirmed)
        })
        .catch(() => {
          if (!stopped) frame.dataset.videoMeasurement = 'unavailable'
        })
    }
    const focused = () => {
      if (document.activeElement === frame) start()
    }
    if (mode === 'embedded-home') {
      if (api)
        void import('@lib/homeV2/visibility')
          .then(({ observeVisible }) => {
            if (!stopped && !observing)
              stopVisibility = observeVisible(frame, start)
          })
          .catch(() => {
            // Focus remains an optional fast path; never infer playback.
          })
      frame.addEventListener('focus', focused)
      window.addEventListener('blur', focused)
    } else start()
    return () => {
      stopped = true
      stopVisibility()
      frame.removeEventListener('focus', focused)
      window.removeEventListener('blur', focused)
      stop()
      frame.remove()
      if (iframeRef?.current === frame) iframeRef.current = null
    }
  }, [embed, title, provider, videoId, mode, iframeRef])
  return <div ref={host} />
}
