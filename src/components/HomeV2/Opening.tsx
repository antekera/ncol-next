import type { HomeArticle } from '@lib/homeV2/types'
import { selectOpeningTreatment } from '@lib/homeV2/compose'
import { ArticleCard } from './ArticleCard'
import { OpeningShell } from './OpeningShell'
import styles from './HomeV2.module.css'

export function Opening({
  featured,
  secondary
}: {
  featured: HomeArticle | null
  secondary: HomeArticle[]
}) {
  const treatment = selectOpeningTreatment(featured)
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
            />
          ))}
        </div>
      )}
    </OpeningShell>
  )
}
