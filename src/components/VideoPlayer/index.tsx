import { RefObject } from 'react'
import { getEmbedUrl } from '@lib/utils/video'

type VideoPlayerProps = {
  url: string
  className?: string
  iframeRef?: RefObject<HTMLIFrameElement | null>
}

export const VideoPlayer = ({
  url,
  className,
  iframeRef
}: VideoPlayerProps) => {
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) return null

  return (
    <div
      className={`relative mb-4 w-full overflow-hidden rounded-sm ${className ?? ''}`}
      style={{ aspectRatio: '16/9' }}
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className='absolute inset-0 h-full w-full'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
        title='Video destacado'
      />
    </div>
  )
}
