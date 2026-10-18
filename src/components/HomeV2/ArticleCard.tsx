import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { cleanText } from '@lib/utils/cleanText'
import { cleanExcerpt } from '@lib/utils/cleanExcerpt'
import type { HomeArticle, HomeSectionConfig } from '@lib/homeV2/types'
import { HomeImage } from './HomeImage'
import styles from './HomeV2.module.css'
import { formatHomeDate } from '@lib/homeV2/dates'
import { HERO_IMAGE_SIZES } from './imageSizes'

export function ArticleCard({
  article,
  module: editorialModule,
  position,
  variant = 'compact',
  sizes,
  serverRenderedImage = false
}: {
  article: HomeArticle
  module: Pick<HomeSectionConfig, 'id' | 'position'>
  position: number
  variant?: 'hero' | 'lead' | 'compact' | 'text'
  sizes?: string
  serverRenderedImage?: boolean
}) {
  const category = article.categories.edges.find(
    edge => !edge.node.slug?.startsWith('_')
  )?.node
  const title = cleanText(article.title)
  const dateLabel = formatHomeDate(article.date)
  const Heading = variant === 'hero' ? 'h1' : 'h3'
  const showImage = variant !== 'text'
  const widths = { hero: 1134, lead: 660, compact: 175, text: 175 }
  const imageSizes = {
    hero: HERO_IMAGE_SIZES,
    compact: '(min-width: 1024px) 260px, 92px',
    lead: '(min-width: 1024px) 360px, 100vw',
    text: '100vw'
  }
  const componentTypes = {
    hero: 'hero',
    lead: 'lead_card',
    compact: 'compact_card',
    text: 'text_list'
  }
  return (
    <article
      className={`${styles.card} ${styles[variant]}`}
      data-module-id={editorialModule.id}
      data-editorial-position={editorialModule.position}
      data-article-id={article.id ?? article.uri}
      data-article-uri={article.uri}
      data-item-position={position}
      data-section-id={category?.slug}
      data-component-type={componentTypes[variant]}
    >
      <HoverPrefetchLink
        href={article.uri}
        aria-label={title}
        className={styles.cardLink}
      >
        {showImage && (
          <HomeImage
            image={article.featuredImage}
            title={title}
            width={serverRenderedImage ? 1134 : widths[variant]}
            sizes={sizes ?? imageSizes[variant]}
            critical={variant === 'hero'}
            serverRendered={serverRenderedImage}
          />
        )}
        <div className={styles.cardCopy}>
          {variant !== 'text' && category?.name && (
            <span className={styles.category}>{category.name}</span>
          )}
          <Heading className={styles.cardTitle}>{title}</Heading>
          {variant === 'hero' && article.excerpt && (
            <p className={styles.excerpt}>
              {cleanText(cleanExcerpt(article.excerpt))}
            </p>
          )}
          {(variant === 'hero' || variant === 'lead') && dateLabel && (
            <time className={styles.date} dateTime={article.date}>
              {dateLabel}
            </time>
          )}
        </div>
      </HoverPrefetchLink>
    </article>
  )
}
