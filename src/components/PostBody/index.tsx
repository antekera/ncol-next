import { PostBodyProps } from 'lib/types'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { ad } from '@lib/ads'
import { XEmbed, TikTokEmbed, YouTubeEmbed } from 'react-social-media-embed'
import React, { JSX, useMemo } from 'react'
import { cn } from '@lib/shared'

const extractInstagramPostId = (url: string) => {
  const match = url.match(/\/p\/([^\/\?]+)/)
  return match ? match[1] : null
}

const InstagramEmbedIframe = ({ url }: { url: string }) => {
  const postId = extractInstagramPostId(url)
  if (postId) {
    return (
      <iframe
        title='Instagram'
        src={`https://www.instagram.com/p/${postId}/embed/?cr=1&v=14&wp=328&rd=https%3A%2F%2Fwww.instagram.com&rp=%2Fp%2F${postId}%2F`}
        width='328'
        height='550'
        allow='encrypted-media'
        style={{
          border: 0,
          borderRadius: '3px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
          maxWidth: '328px'
        }}
      />
    )
  }
  return (
    <div className='instagram-embed-iframe'>
      <p className='instagram-embed-iframe-p'>Instagram Post</p>
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='instagram-embed-iframe-a'
      >
        View on Instagram
      </a>
    </div>
  )
}

const renderContentWithSocialEmbeds = (htmlContent: string) => {
  if (!htmlContent) return null

  const parts = []

  const patterns = [
    {
      name: 'instagram',
      regex:
        /<blockquote[^>]*class="instagram-media"[^>]*data-instgrm-permalink="([^"]+)"[^>]*><\/blockquote>/g,
      component: (url: string, key: string) => (
        <div key={key} className='mx-auto my-6 flex justify-center'>
          <InstagramEmbedIframe url={url} />
        </div>
      )
    },
    {
      name: 'twitter',
      regex:
        /<blockquote[^>]*class="twitter-tweet"[^>]*><a href="([^"]+)"[^>]*><\/a><\/blockquote>/g,
      component: (url: string, key: string) => (
        <XEmbed url={url} width={325} className='mx-auto my-6' key={key} />
      )
    },
    {
      name: 'tiktok',

      regex:
        /<blockquote[^>]*class="tiktok-embed"[^>]*cite="([^"]+)"[^>]*>.*?<\/blockquote>/g,
      component: (url: string, key: string) => (
        <TikTokEmbed url={url} width={325} className='mx-auto my-6' key={key} />
      )
    },
    {
      name: 'youtube',
      regex:
        // eslint-disable-next-line sonarjs/slow-regex
        /<iframe[^>]*src="https:\/\/www\.youtube\.com\/embed\/([^"?]+)[^"]*"[^>]*><\/iframe>/g,
      component: (videoId: string, key: string) => (
        <YouTubeEmbed
          url={`https://www.youtube.com/watch?v=${videoId}`}
          className='max-w-[560px mx-auto aspect-video w-full'
          key={key}
        />
      )
    }
  ]

  const allMatches: Array<{
    index: number
    length: number
    component: JSX.Element
  }> = []

  patterns.forEach(pattern => {
    let match
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)

    while ((match = regex.exec(htmlContent)) !== null) {
      const url = match[1]
      const key = `${pattern.name}-${match.index}`

      allMatches.push({
        index: match.index,
        length: match[0].length,
        component: pattern.component(url, key)
      })
    }
  })

  // Sort matches by index
  allMatches.sort((a, b) => a.index - b.index)

  // Build parts array
  let lastIndex = 0

  allMatches.forEach(match => {
    // Add HTML content before this match
    if (match.index > lastIndex) {
      const htmlBefore = htmlContent.slice(lastIndex, match.index)
      if (htmlBefore.trim()) {
        parts.push(
          <div
            key={`html-${lastIndex}`}
            dangerouslySetInnerHTML={{ __html: htmlBefore }}
          />
        )
      }
    }

    parts.push(match.component)

    lastIndex = match.index + match.length
  })

  if (lastIndex < htmlContent.length) {
    const remainingHtml = htmlContent.slice(lastIndex)
    if (remainingHtml.trim()) {
      parts.push(
        <div
          key={`html-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: remainingHtml }}
        />
      )
    }
  }

  if (parts.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  }

  return <>{parts}</>
}
const PostBody = ({ firstParagraph, secondParagraph }: PostBodyProps) => {
  const processedFirstParagraph = useMemo(
    () => renderContentWithSocialEmbeds(firstParagraph || ''),
    [firstParagraph]
  )

  const processedSecondParagraph = useMemo(
    () => renderContentWithSocialEmbeds(secondParagraph || ''),
    [secondParagraph]
  )

  return (
    <>
      <div className={cn('capital-letter', 'post-body')}>
        {processedFirstParagraph}
      </div>

      <AdSenseBanner {...ad.single.in_article} />

      <div
        className={cn('post-body', '[&_.fb_iframe_widget_fluid_desktop_iframe]:!w-full')}
      >
        {processedSecondParagraph}
      </div>
    </>
  )
}

export { PostBody }