import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import type { HomeSection } from '@lib/homeV2/types'
import { ArticleCard } from './ArticleCard'
import styles from './HomeV2.module.css'

export function SectionHeading({
  title,
  href
}: {
  title: string
  href?: string
}) {
  return (
    <div className={styles.sectionHeading}>
      <h2>{title}</h2>
      {href && (
        <HoverPrefetchLink
          href={href}
          aria-label={`Ver más de ${title}`}
          data-component-type='section_link'
        >
          Ver más <span aria-hidden='true'>→</span>
        </HoverPrefetchLink>
      )}
    </div>
  )
}

export function Section({ section }: { section: HomeSection }) {
  const [lead, ...rest] = section.articles
  return (
    <section
      className={styles.section}
      aria-label={section.title}
      data-module-id={section.id}
      data-editorial-position={section.position}
    >
      <SectionHeading title={section.title} href={section.href} />
      {lead ? (
        <>
          <ArticleCard
            article={lead}
            module={section}
            position={1}
            variant='lead'
          />
          <div className={styles.sectionList}>
            {rest.map((post, index) => (
              <ArticleCard
                key={post.id ?? post.uri}
                article={post}
                module={section}
                position={index + 2}
                variant='text'
              />
            ))}
          </div>
        </>
      ) : (
        <p className={styles.empty}>
          No hay noticias disponibles en este momento.
        </p>
      )}
    </section>
  )
}
