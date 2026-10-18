import type { HomeArticle, OpeningTreatment } from '@lib/homeV2/types'
import { selectOpeningTreatment } from '@lib/homeV2/compose'
import { ArticleCard } from './ArticleCard'
import { OpeningShell } from './OpeningShell'
import styles from './HomeV2.module.css'
import {
  OPENING_SECONDARY_IMAGE_SIZES,
  photographicHeroSizes
} from './imageSizes'

export function Opening({
  featured,
  secondary,
  previewTreatment,
  heroHeading = 'h1'
}: {
  featured: HomeArticle | null
  secondary: HomeArticle[]
  previewTreatment?: Exclude<OpeningTreatment, 'current'>
  heroHeading?: 'h1' | 'h2'
}) {
  const treatment = previewTreatment ?? selectOpeningTreatment(featured)
  const dimensions = featured?.featuredImage?.node.mediaDetails
  return (
    <OpeningShell
      key={`${featured?.id ?? 'empty'}-${treatment}`}
      treatment={treatment}
    >
      {featured ? (
        <ArticleCard
          article={featured}
          module={{ id: 'opening', position: 1 }}
          position={1}
          variant='hero'
          heroHeading={heroHeading}
          imageWidth={
            treatment === 'photographic'
              ? (dimensions?.width ?? undefined)
              : undefined
          }
          sizes={
            treatment === 'photographic'
              ? photographicHeroSizes(
                  (dimensions?.width ?? 16) / (dimensions?.height ?? 9)
                )
              : undefined
          }
        />
      ) : (
        <div className={styles.empty}>
          <h1>Noticias de Venezuela y del Zulia</h1>
          <p>No hay noticias de portada disponibles en este momento.</p>
        </div>
      )}
      {secondary.length > 0 && (
        <div className={styles.secondary}>
          {secondary.map((post, index) => (
            <ArticleCard
              key={post.id ?? post.uri}
              article={post}
              module={{ id: 'opening', position: 1 }}
              position={index + 2}
              sizes={
                treatment === 'traditional'
                  ? '92px'
                  : OPENING_SECONDARY_IMAGE_SIZES
              }
            />
          ))}
        </div>
      )}
    </OpeningShell>
  )
}
