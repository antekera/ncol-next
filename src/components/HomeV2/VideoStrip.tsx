'use client'

import { useEffect, useRef, useState } from 'react'
import { mountVideoCarousel } from '@lib/homeV2/videoCarousel'
import { getEmbedUrl } from '@lib/utils/video'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import type { HomeArticle } from '@lib/homeV2/types'
import { HomeImage } from './HomeImage'
import { SectionHeading } from './Section'
import { ActivatedVideo } from './ActivatedVideo'
import styles from './HomeV2.module.css'

export function VideoStrip({ posts }: { posts: HomeArticle[] }) {
  const strip = useRef<HTMLDivElement>(null)
  const carousel = useRef<ReturnType<typeof mountVideoCarousel> | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const videos = posts.flatMap(post => {
    const embed = getEmbedUrl(post.customFields?.videodestacado ?? '')
    return embed
      ? [
          {
            post,
            embed,
            provider: embed.includes('youtube.com/')
              ? ('youtube' as const)
              : ('dailymotion' as const),
            videoId: new URL(embed).pathname.split('/').at(-1) ?? ''
          }
        ]
      : []
  })
  useEffect(() => {
    if (!strip.current) return
    const mounted = mountVideoCarousel(strip.current)
    carousel.current = mounted
    return () => {
      mounted.stop()
      carousel.current = null
    }
  }, [videos.length])
  if (!videos.length) return null
  return (
    <section
      className={styles.section}
      aria-label='Videos recientes'
      data-module-id='videos'
      data-editorial-position='6'
    >
      <SectionHeading title='Videos recientes' href='/videos/' />
      <div className={styles.videoControls}>
        <button
          type='button'
          aria-label='Videos anteriores'
          onClick={() => carousel.current?.move('previous')}
        >
          ‹
        </button>
        <button
          type='button'
          aria-label='Videos siguientes'
          onClick={() => carousel.current?.move('next')}
        >
          ›
        </button>
      </div>
      <div
        className={styles.videoStrip}
        ref={strip}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- A native scroll region needs a keyboard focus target.
        tabIndex={0}
        role='region'
        aria-roledescription='carrusel'
        aria-label='Carrusel de videos'
      >
        {videos.map(({ post, embed, provider, videoId }, index) => (
          <article
            key={post.id ?? post.uri}
            className={styles.videoCard}
            data-article-id={post.id ?? post.uri}
            data-article-uri={post.uri}
            data-item-position={index + 1}
            data-component-type='video_card'
            data-video-provider={provider}
            data-video-id={videoId}
            data-section-id='videos'
          >
            <div className={styles.videoMedia}>
              {active === post.uri ? (
                <ActivatedVideo
                  title={post.title}
                  embed={embed}
                  provider={provider}
                  videoId={videoId}
                />
              ) : (
                <button
                  type='button'
                  aria-label={`Reproducir: ${post.title}`}
                  onClick={() => setActive(post.uri)}
                >
                  <HomeImage
                    image={post.featuredImage}
                    title={post.title}
                    width={371}
                    sizes='(min-width:1024px) 280px, 85vw'
                  />
                  <span className={styles.play} aria-hidden='true'>
                    ▶
                  </span>
                </button>
              )}
            </div>
            <h3>
              <HoverPrefetchLink href={post.uri} aria-label={post.title}>
                {post.title}
              </HoverPrefetchLink>
            </h3>
          </article>
        ))}
      </div>
    </section>
  )
}
