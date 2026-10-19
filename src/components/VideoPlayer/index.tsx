'use client'

import { RefObject } from 'react'
import { useInView } from 'react-intersection-observer'
import { getEmbedUrl } from '@lib/utils/video'
import { ProviderVideo } from './ProviderVideo'

type VideoPlayerProps = {
  url: string
  className?: string
  iframeRef?: RefObject<HTMLIFrameElement | null>
  /** Prepare API parameters only in the explicitly enabled local Home build. */
  homeMeasurement?: boolean
  deferUntilVisible?: boolean
}

export const VideoPlayer = ({
  url,
  className,
  iframeRef,
  homeMeasurement = false,
  deferUntilVisible = false
}: VideoPlayerProps) => {
  const { ref, inView } = useInView({
    skip: !deferUntilVisible,
    rootMargin: '200px',
    triggerOnce: true,
    fallbackInView: true
  })
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) return null

  return (
    <div
      ref={ref}
      data-video-provider={
        embedUrl.includes('youtube.com/') ? 'youtube' : 'dailymotion'
      }
      className={`relative mb-4 w-full overflow-hidden rounded-sm ${className ?? ''}`}
      style={{ aspectRatio: '16/9' }}
    >
      {(!deferUntilVisible || inView) &&
        (homeMeasurement ? (
          <ProviderVideo
            embed={embedUrl}
            title='Video destacado'
            provider={
              embedUrl.includes('youtube.com/') ? 'youtube' : 'dailymotion'
            }
            videoId={new URL(embedUrl).pathname.split('/').at(-1) ?? ''}
            mode='embedded-home'
            iframeRef={iframeRef}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className='absolute inset-0 h-full w-full'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            title='Video destacado'
          />
        ))}
    </div>
  )
}
