'use client'

import { useRef, useState } from 'react'
import { getEmbedUrl } from '@lib/utils/video'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import type { HomeArticle } from '@lib/homeV2/types'
import { HomeImage } from './HomeImage'
import { SectionHeading } from './Section'
import styles from './HomeV2.module.css'

export function VideoStrip({ posts }: { posts: HomeArticle[] }) {
  const strip = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const videos = posts.flatMap(post => {
    const embed = getEmbedUrl(post.customFields?.videodestacado ?? '')
    return embed ? [{ post, embed }] : []
  })
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
          onClick={() =>
            strip.current?.scrollBy({
              left: -strip.current.clientWidth,
              behavior: 'smooth'
            })
          }
        >
          ‹
        </button>
        <button
          type='button'
          aria-label='Videos siguientes'
          onClick={() =>
            strip.current?.scrollBy({
              left: strip.current.clientWidth,
              behavior: 'smooth'
            })
          }
        >
          ›
        </button>
      </div>
      <div className={styles.videoStrip} ref={strip}>
        {videos.map(({ post, embed }, index) => (
          <article
            key={post.id ?? post.uri}
            className={styles.videoCard}
            data-article-id={post.id ?? post.uri}
            data-item-position={index + 1}
            data-component-type='video_card'
          >
            <div className={styles.videoMedia}>
              {active === post.uri ? (
                <iframe
                  title={post.title}
                  src={`${embed}?autoplay=1`}
                  allow='autoplay; encrypted-media; picture-in-picture'
                  allowFullScreen
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
