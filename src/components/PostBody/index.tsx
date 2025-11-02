import { PostBodyProps } from 'lib/types'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { ad } from '@lib/ads'
import { XEmbed, TikTokEmbed, YouTubeEmbed } from 'react-social-media-embed'
import React, { JSX, useMemo } from 'react'

const extractInstagramPostId = (url: string) => {
  const match = /\/p\/([^\/\?]+)/.exec(url)
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
    <div className='max-w-sm rounded-lg border border-gray-300 p-4 text-center'>
      <p className='mb-2 text-neutral-600'>Instagram Post</p>
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='text-blue-500 underline hover:text-blue-700'
      >
        View on Instagram
      </a>
    </div>
  )
}

const postBodyClasses =
  '[&_a]:text-primary [&_.entry-content-asset]:aspect-h-9 [&_.entry-content-asset]:aspect-w-16 mx-auto max-w-2xl text-base lg:text-lg leading-8 [&_a]:underline [&_audio]:w-full [&_b]:font-[var(--font-martel)] [&_b]:font-extrabold [&_blockquote]:my-6 [&_blockquote]:ml-0 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-500 [&_blockquote]:bg-slate-200 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_blockquote]:font-[var(--font-martel)] [&_blockquote]:font-normal [&_blockquote]:italic [&_blockquote]:antialiased [&_blockquote_cite]:not-italic [&_blockquote_p]:mt-0 [&_br]:mb-5 [&_br]:block [&_code]:text-sm [&_figcaption]:text-center [&_figcaption]:text-sm [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:leading-10 [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-2xl [&_h3]:leading-10 [&_h4]:mt-6 [&_h4]:mb-4 [&_h4]:text-xl [&_h4]:leading-10 [&_iframe]:!w-full [&_img]:mb-4 [&_img]:lg:max-h-96 [&_img]:w-full [&_img]:rounded-md [&_img]:object-cover [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:font-[var(--font-martel)] [&_ol]:font-normal [&_ol]:antialiased [&_ol>li>ol]:my-0 [&_ol>li>ol]:ml-4 [&_p]:my-6 [&_p]:font-[var(--font-martel)] [&_p]:font-normal [&_p]:antialiased [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-slate-500 [&_pre]:bg-slate-200 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-7 [&_pre]:whitespace-pre [&_strong]:font-[var(--font-martel)] [&_strong]:font-extrabold [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:font-[var(--font-martel)] [&_ul]:font-normal [&_ul]:antialiased [&_ul>li>ul]:my-0 [&_ul>li>ul]:ml-4 [&_ul>li>ul]:list-[circle] dark:text-neutral-300'

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
    // Reconstruct regex from known literal pattern
    // eslint-disable-next-line security/detect-non-literal-regexp
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
      <div className={`capital-letter post-body ${postBodyClasses}`}>
        {processedFirstParagraph}
      </div>

      <AdSenseBanner {...ad.single.in_article} />

      <div
        className={`${postBodyClasses} [&_.fb_iframe_widget_fluid_desktop_iframe]:!w-full`}
      >
        {processedSecondParagraph}
      </div>
    </>
  )
}

export { PostBody }
