'use client'

import useSWR from 'swr'
import { useInView } from 'react-intersection-observer'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { SafeImage } from '@components/ui/safe-image'
import {
  BCV_API_URL,
  BCV_SWR_OPTIONS,
  bcvFetcher,
  type BcvResponse
} from '@lib/api/BcvRatesClient'
import { useOpinionAuthors } from '@lib/hooks/data/useOpinionAuthors'
import { siteUrl } from '@lib/siteUrl'
import { SectionHeading } from './Section'
import styles from './HomeV2.module.css'

const money = (value: number | undefined) =>
  value
    ? new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    : '—'

export function RateCard({ data }: { data?: BcvResponse }) {
  return (
    <section
      className={styles.rate}
      aria-label='Dólar BCV'
      data-module-id='bcv'
      data-editorial-position='1'
    >
      <h2>Dólar BCV</h2>
      <p className={styles.date}>
        {data?.current.date
          ? new Intl.DateTimeFormat('es-VE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC'
            }).format(new Date(data.current.date))
          : 'Tasa oficial del Banco Central de Venezuela'}
      </p>
      <dl data-rate-ready={!!data?.current.usd}>
        <div>
          <dt>USD</dt>
          <dd>{money(data?.current.usd)}</dd>
        </div>
        <div>
          <dt>EUR</dt>
          <dd>{money(data?.current.eur)}</dd>
        </div>
      </dl>
      <HoverPrefetchLink
        href='/dolar-hoy/'
        className={styles.rateButton}
        data-service-id='calculator'
        data-component-type='service_link'
      >
        Ver calculadora <span aria-hidden='true'>→</span>
      </HoverPrefetchLink>
    </section>
  )
}
export function BcvWidget() {
  const { data } = useSWR<BcvResponse>(BCV_API_URL, bcvFetcher, BCV_SWR_OPTIONS)
  return <RateCard data={data} />
}

interface RankingPost {
  slug: string
  title: string
  image: string
}
const rankingFetcher = async (
  url: string
): Promise<{ posts: RankingPost[] }> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Ranking unavailable')
  return response.json()
}

export function RankingWidget() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '100px' })
  const { data } = useSWR<{ posts: RankingPost[] }>(
    inView ? '/api/most-visited?limit=5&days=7' : null,
    rankingFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000
    }
  )
  return (
    <section
      ref={ref}
      className={styles.ranking}
      aria-label='Lo más visto en 7 días'
      data-module-id='ranking'
      data-editorial-position='2'
    >
      <SectionHeading title='Lo más visto en 7 días' href='/mas-leidos/' />
      <ol>
        {data?.posts.map((post, index) => (
          <li
            key={post.slug}
            data-article-id={post.slug}
            data-article-uri={siteUrl(post.slug)}
            data-item-position={index + 1}
            data-component-type='ranking_item'
          >
            <span aria-hidden='true'>{index + 1}</span>
            <HoverPrefetchLink href={siteUrl(post.slug)}>
              {post.title}
            </HoverPrefetchLink>
          </li>
        )) ?? <li className={styles.empty}>Cargando lo más visto…</li>}
      </ol>
    </section>
  )
}

export function OpinionWidget() {
  const { authors, isLoading } = useOpinionAuthors()
  return (
    <section
      aria-label='Opinión'
      data-module-id='opinion'
      data-editorial-position='4'
    >
      <SectionHeading title='Opinión' href='/categoria/opinion/' />
      <ul className={styles.opinion}>
        {authors.slice(0, 4).map((author, index) => (
          <li key={author.slug}>
            {author.avatarUrl && (
              <SafeImage
                src={author.avatarUrl}
                alt={author.name}
                width={42}
                height={52}
              />
            )}
            <div>
              <HoverPrefetchLink
                className={styles.authorName}
                href={author.uri}
              >
                {author.name}
              </HoverPrefetchLink>
              <HoverPrefetchLink
                href={author.latestPost.uri}
                data-article-id={author.latestPost.uri}
                data-article-uri={author.latestPost.uri}
                data-item-position={index + 1}
                data-component-type='compact_card'
                data-section-id='opinion'
              >
                {author.latestPost.title}
              </HoverPrefetchLink>
            </div>
          </li>
        ))}
      </ul>
      {isLoading && <p className={styles.empty}>Cargando columnas…</p>}
    </section>
  )
}
