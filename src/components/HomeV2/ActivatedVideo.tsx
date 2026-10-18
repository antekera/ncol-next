'use client'

import { useEffect, useRef } from 'react'
import {
  isHomeMediaMeasured,
  reportVideoPlay,
  type VideoProvider
} from '@lib/homeV2/mediaBridge'

/** React owns the host; the provider owns its iframe and may destroy it safely. */
export function ActivatedVideo({
  embed,
  title,
  provider,
  videoId
}: {
  embed: string
  title: string
  provider: VideoProvider
  videoId: string
}) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = host.current
    if (!container) return
    const measured = isHomeMediaMeasured(container)
    const api =
      measured &&
      provider === 'youtube' &&
      /^[a-zA-Z0-9_-]{6,64}$/.test(videoId)
    const source = new URL(embed)
    source.searchParams.set('autoplay', '1')
    if (api) {
      source.searchParams.set('enablejsapi', '1')
      source.searchParams.set('origin', window.location.origin)
    }
    const frame = document.createElement('iframe')
    frame.title = title
    frame.src = source.href
    frame.allow = 'autoplay; encrypted-media; picture-in-picture'
    frame.allowFullscreen = true
    const nativeMeasurement = measured ? 'unsupported-provider' : 'off'
    frame.dataset.videoMeasurement = api
      ? 'pending-provider'
      : nativeMeasurement
    container.append(frame)
    let stopped = false
    let stop = () => {}
    if (api)
      void import('@lib/homeV2/youtubePlayback')
        .then(({ observeYoutubePlayback }) => {
          if (stopped || !isHomeMediaMeasured(container)) return
          stop = observeYoutubePlayback(frame, () => {
            frame.dataset.videoMeasurement = 'confirmed'
            reportVideoPlay(frame, provider, videoId)
          })
        })
        .catch(() => {
          frame.dataset.videoMeasurement = 'unavailable'
        })
    return () => {
      stopped = true
      stop()
      frame.remove()
    }
  }, [embed, title, provider, videoId])
  return <div ref={host} />
}
