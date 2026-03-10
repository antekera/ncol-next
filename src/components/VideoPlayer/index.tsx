'use client'

type VideoPlayerProps = {
  url: string
  className?: string
}

function getYoutubeEmbedUrl(hostname: string, { pathname, searchParams }: URL): string | null {
  if (hostname !== 'youtube.com' && hostname !== 'youtu.be') return null

  if (hostname === 'youtu.be') return `https://www.youtube.com/embed/${pathname.slice(1)}`
  if (pathname.startsWith('/embed/')) return `https://www.youtube.com/embed/${pathname.replace('/embed/', '')}`
  if (pathname.startsWith('/live/')) return `https://www.youtube.com/embed/${pathname.replace('/live/', '')}`

  const id = searchParams.get('v')
  return id ? `https://www.youtube.com/embed/${id}` : null
}

function getDailymotionEmbedUrl(hostname: string, { pathname }: URL): string | null {
  if (hostname === 'dai.ly') {
    const id = pathname.slice(1)
    return id ? `https://www.dailymotion.com/embed/video/${id}` : null
  }

  if (hostname === 'dailymotion.com') {
    const match = /\/video\/([^/?]+)/.exec(pathname)
    return match ? `https://www.dailymotion.com/embed/video/${match[1]}` : null
  }

  return null
}

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace('www.', '')

    return (
      getYoutubeEmbedUrl(hostname, parsed) ||
      getDailymotionEmbedUrl(hostname, parsed)
    )
  } catch {
    return null
  }
}

export { getEmbedUrl }

export const VideoPlayer = ({ url, className }: VideoPlayerProps) => {
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) return null

  return (
    <div
      className={`relative mb-4 w-full overflow-hidden rounded-sm ${className ?? ''}`}
      style={{ aspectRatio: '16/9' }}
    >
      <iframe
        src={embedUrl}
        className='absolute inset-0 h-full w-full'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
        title='Video destacado'
      />
    </div>
  )
}
