'use client'

import { useRef, useState } from 'react'
import { getHomeV2Region } from '@app/actions/getHomeV2Region'
import type { HomeArticle, HomeCategory, HomeSection } from '@lib/homeV2/types'
import { ArticleCard } from './ArticleCard'
import { SectionHeading } from './Section'
import styles from './HomeV2.module.css'

export function RegionalFilter({
  section,
  regions
}: {
  section: HomeSection
  regions: HomeCategory[]
}) {
  const [selected, setSelected] = useState('zulia')
  const [view, setView] = useState({
    articles: section.articles,
    region: 'zulia'
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const cache = useRef(
    new Map<string, HomeArticle[]>([['zulia', section.articles]])
  )
  const sequence = useRef(0)
  const change = async (slug: string) => {
    if (slug === selected && !error) return
    const request = ++sequence.current
    setSelected(slug)
    setError(false)
    const saved = cache.current.get(slug)
    if (saved) {
      setView({ articles: saved, region: slug })
      setBusy(false)
      return
    }
    setBusy(true)
    try {
      const result = await getHomeV2Region(slug)
      if (request !== sequence.current) return
      if (result.ok) {
        cache.current.set(slug, result.articles)
        setView({ articles: result.articles, region: slug })
      } else setError(true)
    } catch {
      if (request === sequence.current) setError(true)
    } finally {
      if (request === sequence.current) setBusy(false)
    }
  }
  const tabs = regions.filter(region =>
    ['zulia', 'costa-oriental', 'maracaibo', 'san-francisco'].includes(
      region.slug
    )
  )
  const [lead, ...rest] = view.articles
  const feedback = error
    ? 'No pudimos actualizar las noticias. Inténtalo de nuevo.'
    : ''
  return (
    <section
      className={styles.section}
      aria-label='Todo Zulia'
      data-module-id='zulia'
      data-editorial-position={section.position}
      data-region-id={view.region}
      aria-busy={busy}
    >
      <SectionHeading title='Todo Zulia' href={section.href} />
      <div className={styles.filters}>
        {tabs.map(region => (
          <button
            key={region.id}
            type='button'
            data-home-region-select={region.slug}
            aria-pressed={selected === region.slug}
            onClick={() => {
              void change(region.slug)
            }}
          >
            {region.slug === 'zulia' ? 'Todo Zulia' : region.name}
          </button>
        ))}
        <select
          aria-label='Municipio o región'
          data-home-region-select
          value={selected}
          onChange={event => {
            void change(event.target.value)
          }}
        >
          <option value='zulia'>Municipio: Todos</option>
          {regions
            .filter(region => region.slug !== 'zulia')
            .map(region => (
              <option key={region.id} value={region.slug}>
                {region.name}
              </option>
            ))}
        </select>
      </div>
      <p role='status' className={styles.status}>
        {busy ? 'Actualizando noticias…' : feedback}
      </p>
      {lead ? (
        <>
          <div className={styles.regionalGrid}>
            <ArticleCard
              article={lead}
              module={section}
              position={1}
              variant='lead'
            />
            <div className={styles.regionalSide}>
              {rest.slice(0, 3).map((post, index) => (
                <ArticleCard
                  key={post.id ?? post.uri}
                  article={post}
                  module={section}
                  position={index + 2}
                />
              ))}
            </div>
          </div>
          <div className={styles.regionalTail}>
            {rest.slice(3).map((post, index) => (
              <ArticleCard
                key={post.id ?? post.uri}
                article={post}
                module={section}
                position={index + 5}
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
