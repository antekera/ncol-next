'use client'

import { useRef, useState } from 'react'
import { getHomeV2Region } from '@app/actions/getHomeV2Region'
import type { HomeArticle, HomeCategory, HomeSection } from '@lib/homeV2/types'
import { ArticleCard } from './ArticleCard'
import { SectionHeading } from './Section'
import styles from './HomeV2.module.css'
import { REGIONAL_LEAD_IMAGE_SIZES } from './imageSizes'
import { fetchPublicRegion } from '@lib/homeV2/fetchPublicRegion'
import { homeEditorialDay } from '@lib/homeV2/editorialPolicy'

export function RegionalFilter({
  section,
  regions,
  serverRenderedLead = false,
  publicRegionApi = false,
  initialDay,
  initialCacheUntil
}: {
  section: HomeSection
  regions: HomeCategory[]
  serverRenderedLead?: boolean
  publicRegionApi?: boolean
  initialDay?: string
  initialCacheUntil?: number
}) {
  const [selected, setSelected] = useState('zulia')
  const [view, setView] = useState({
    articles: section.articles,
    region: 'zulia'
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const cache = useRef<Map<
    string,
    { articles: HomeArticle[]; until: number }
  > | null>(null)
  if (!cache.current)
    cache.current = new Map([
      [
        publicRegionApi ? `${initialDay}:zulia` : 'zulia',
        {
          articles: section.articles,
          until: publicRegionApi ? (initialCacheUntil ?? 0) : Infinity
        }
      ]
    ])
  const results = cache.current
  const sequence = useRef(0)
  const change = async (slug: string) => {
    if (slug === selected && !error) return
    const request = ++sequence.current
    setSelected(slug)
    setError(false)
    const key = publicRegionApi ? `${homeEditorialDay()}:${slug}` : slug
    const saved = results.get(key)
    if (saved && Date.now() < saved.until) {
      setView({ articles: saved.articles, region: slug })
      setBusy(false)
      return
    }
    setBusy(true)
    try {
      const result = publicRegionApi
        ? await fetchPublicRegion(slug)
        : {
            ...(await getHomeV2Region(slug)),
            cacheUntil: Infinity,
            editorialDay: ''
          }
      if (request !== sequence.current) return
      if (result.ok) {
        results.set(publicRegionApi ? `${result.editorialDay}:${slug}` : slug, {
          articles: result.articles,
          until: result.cacheUntil
        })
        setView({ articles: result.articles, region: slug })
      } else setError(true)
    } catch {
      if (request === sequence.current) setError(true)
    } finally {
      if (request === sequence.current) setBusy(false)
    }
  }
  const tabs = ['zulia', 'costa-oriental', 'maracaibo', 'san-francisco']
    .map(slug => regions.find(region => region.slug === slug))
    .filter((region): region is HomeCategory => !!region)
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
              sizes={REGIONAL_LEAD_IMAGE_SIZES}
              serverRenderedImage={serverRenderedLead}
            />
            <div className={styles.regionalSide}>
              {rest.slice(0, 3).map((post, index) => (
                <ArticleCard
                  key={post.id ?? post.uri}
                  article={post}
                  module={section}
                  position={index + 2}
                  sizes='80px'
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
