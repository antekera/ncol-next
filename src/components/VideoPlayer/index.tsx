'use client'

type VideoPlayerProps = {
  url: string
  className?: string
}

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace('www.', '')

    // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    if (hostname === 'youtube.com' || hostname === 'youtu.be') {
      let id: string | null = null
      if (hostname === 'youtu.be') {
        id = parsed.pathname.slice(1)
      } else if (parsed.pathname.startsWith('/embed/')) {
        id = parsed.pathname.replace('/embed/', '')
      } else {
        id = parsed.searchParams.get('v')
      }
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    // Dailymotion: dailymotion.com/video/ID
    if (hostname === 'dailymotion.com') {
      const match = /\/video\/([^/?]+)/.exec(parsed.pathname)
      if (match) return `https://www.dailymotion.com/embed/video/${match[1]}`
    }
  } catch {
    // invalid URL — fall through
  }
  return null
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
