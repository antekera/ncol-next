import { RefObject } from 'react'
import { getEmbedUrl } from '@lib/utils/video'
import { ProviderVideo } from './ProviderVideo'

type VideoPlayerProps = {
  url: string
  className?: string
  iframeRef?: RefObject<HTMLIFrameElement | null>
  /** Prepare API parameters only in the explicitly enabled local Home build. */
  homeMeasurement?: boolean
}

export const VideoPlayer = ({
  url,
  className,
  iframeRef,
  homeMeasurement = false
}: VideoPlayerProps) => {
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) return null

  return (
    <div
      className={`relative mb-4 w-full overflow-hidden rounded-sm ${className ?? ''}`}
      style={{ aspectRatio: '16/9' }}
    >
      {homeMeasurement ? (
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
      )}
    </div>
  )
}
