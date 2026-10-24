import { getHomeEditorialEditions } from '../editorialEditions'
import { headlineExpiresAt } from '../editorialPolicy'
import type { HomeArticle, HomeV2Data } from '../types'
const now = Date.parse('2026-10-23T15:00:00Z')
const ordinary: HomeArticle = {
  id: 'ordinary',
  uri: '/ordinary/',
  title: 'Noticia sin fecha',
  date: '2020-01-01T00:00:00Z',
  categories: { edges: [{ node: { slug: 'zulia', name: 'Zulia' } }] }
}
const source = (posts: HomeArticle[], featured = posts[0]): HomeV2Data => ({
  featured,
  sections: { opening: posts, latest: posts, zulia: posts },
  regions: [],
  errors: []
})
it('expires manual priority but retains old undated news in other modules', () => {
  const manual: HomeArticle = {
    ...ordinary,
    id: 'manual',
    uri: '/manual/',
    date: '2026-10-22T15:00:01Z',
    customFields: { noticiadestacada: true },
    categories: { edges: [{ node: { slug: 'deportes', name: 'Deportes' } }] }
  }
  const editions = getHomeEditorialEditions(
    source([ordinary, manual], manual),
    now
  )
  expect(editions.map(e => e.at)).toEqual([now, now + 1000])
  expect(editions[0].data.featured?.id).toBe('manual')
  expect(editions[1].data.featured?.id).toBe('ordinary')
  expect(editions[1].data.sections.latest.map(p => p.id)).toEqual([
    'ordinary',
    'manual'
  ])
  expect(editions[1].sections.find(s => s.id === 'opening')?.articles).toEqual(
    []
  )
})
it('removes explicit dates everywhere and backfills modules from the same pool', () => {
  const dated = {
    ...ordinary,
    id: 'dated',
    uri: '/dated/',
    title: 'Jornada del 23 de octubre de 2026'
  }
  const editions = getHomeEditorialEditions(source([dated, ordinary]), now)
  expect(editions.map(e => e.at)).toEqual([
    now,
    Date.parse('2026-10-24T04:00:00Z')
  ])
  expect(editions[1].data.featured?.id).toBe('ordinary')
  for (const posts of Object.values(editions[1].data.sections))
    expect(posts).toEqual([ordinary])
})
it('preserves range endpoints and ordinary news without adding future states', () => {
  expect(
    headlineExpiresAt(
      { ...ordinary, title: 'Jornada del 23 al 25 de octubre de 2026' },
      '2026-10-23'
    )
  ).toBe(Date.parse('2026-10-26T04:00:00Z'))
  expect(getHomeEditorialEditions(source([ordinary]), now)).toHaveLength(1)
})
it('does not resurrect an expired yearless title when another future item expires after year end', () => {
  const dated = { ...ordinary, id: 'dated', title: 'Jornada del 23 de octubre' }
  const future = {
    ...ordinary,
    id: 'future',
    title: 'Evento del 10 de febrero de 2027'
  }
  const editions = getHomeEditorialEditions(
    source([dated, future, ordinary]),
    now
  )
  expect(editions.at(-1)?.data.sections.latest).toEqual([ordinary])
})
