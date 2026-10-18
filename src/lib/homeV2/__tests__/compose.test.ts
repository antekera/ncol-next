import {
  composeHomeSections,
  getDescendantIds,
  selectFeaturedArticle,
  selectOpeningTreatment
} from '../compose'
import { HOME_V2_SECTIONS } from '../sections'
import type { HomeArticle, HomeCategory, HomeSectionConfig } from '../types'

const article = (
  id: string,
  extra: Partial<HomeArticle> = {}
): HomeArticle => ({
  id,
  uri: `/nacionales/10/17/${id}/`,
  title: `Noticia editorial ${id}`,
  categories: { edges: [] },
  ...extra
})

const config: readonly HomeSectionConfig[] = [
  {
    id: 'nacionales',
    title: 'Nacionales',
    categorySlug: 'nacionales',
    position: 2,
    presentation: 'lead_list',
    limit: 2,
    href: '/categoria/nacionales/',
    includeDescendants: true
  },
  {
    id: 'zulia',
    title: 'Todo Zulia',
    categorySlug: 'zulia',
    position: 1,
    presentation: 'regional',
    limit: 3,
    href: '/categoria/zulia/',
    includeDescendants: true
  }
]

it('keeps editorial order and excludes featured/duplicate stories across modules', () => {
  const cover = article('cover')
  const sections = composeHomeSections(
    {
      featured: cover,
      sections: {
        zulia: [
          cover,
          article('shared'),
          article('local'),
          article('local'),
          article('third')
        ],
        nacionales: [
          article('shared'),
          article('national-1'),
          article('national-2'),
          article('national-3')
        ]
      },
      regions: [],
      errors: []
    },
    config
  )
  expect(
    sections.map(section => ({
      id: section.id,
      articles: section.articles.map(post => post.id)
    }))
  ).toEqual([
    { id: 'zulia', articles: ['shared', 'local', 'third'] },
    { id: 'nacionales', articles: ['national-1', 'national-2'] }
  ])
})

it('keeps empty modules in the model without hiding successful modules', () => {
  expect(
    composeHomeSections(
      {
        featured: null,
        sections: { nacionales: [article('ok')] },
        regions: [],
        errors: ['zulia']
      },
      config
    ).map(s => [s.id, s.articles.length])
  ).toEqual([
    ['zulia', 0],
    ['nacionales', 1]
  ])
})

it('uses a canonical URI when an upstream story has no id', () => {
  const first = article('old', { id: undefined, uri: '/nota' })
  const second = article('new', { id: undefined, uri: '/nota/' })
  expect(
    composeHomeSections(
      {
        featured: null,
        sections: { zulia: [first, second] },
        regions: [],
        errors: []
      },
      config
    )[0].articles
  ).toHaveLength(1)
})

it.each([
  [config.map(s => ({ ...s, id: 'same' })), 'module id'],
  [config.map(s => ({ ...s, position: 1 })), 'editorial position'],
  [[{ ...config[0], position: 0 }], 'editorial position'],
  [[{ ...config[0], limit: -1 }], 'limit']
])(
  'rejects ambiguous configuration instead of producing untraceable cards',
  (invalid, message) => {
    expect(() =>
      composeHomeSections(
        { featured: null, sections: {}, regions: [], errors: [] },
        invalid
      )
    ).toThrow(message)
  }
)

it('selects the editorially flagged featured story before the most recent story', () => {
  const recent = article('recent')
  const featured = article('featured', {
    date: '2026-10-18T10:00:00',
    customFields: { noticiadestacada: true }
  })
  expect(
    selectFeaturedArticle(
      [recent, featured],
      Date.parse('2026-10-18T15:00:00Z')
    )
  ).toBe(featured)
  expect(selectFeaturedArticle([recent])).toBe(recent)
  expect(selectFeaturedArticle([])).toBeNull()
})

it.each([
  ['2026-10-19T13:59:59.999Z', 'featured'],
  ['2026-10-19T14:00:00.000Z', 'recent'],
  ['2026-10-19T14:00:00.001Z', 'recent']
])('expires manual priority after 24 elapsed hours (%s)', (now, expected) => {
  const recent = article('recent')
  const featured = article('featured', {
    date: '2026-10-18T10:00:00',
    customFields: { noticiadestacada: true }
  })
  expect(selectFeaturedArticle([recent, featured], Date.parse(now))?.id).toBe(
    expected
  )
})

it.each([
  undefined,
  'invalid',
  '2026-10-18',
  '2026-10-20T10:00:00',
  '2026-02-30T10:00:00'
])(
  'does not grant manual priority without a valid past publication timestamp (%s)',
  date => {
    const recent = article('recent')
    const marked = article('marked', {
      date,
      customFields: { noticiadestacada: true }
    })
    expect(
      selectFeaturedArticle(
        [recent, marked],
        Date.parse('2026-10-18T15:00:00Z')
      )
    ).toBe(recent)
  }
)

it.each([
  '2026-10-18T14:00:00Z',
  '2026-10-18T10:00:00-04:00',
  '2026-10-18T17:00:00+03:00'
])('uses elapsed time rather than the server timezone for %s', date => {
  const recent = article('recent')
  const marked = article('marked', {
    date,
    customFields: { noticiadestacada: true }
  })
  expect(
    selectFeaturedArticle([recent, marked], Date.parse('2026-10-19T13:59:59Z'))
  ).toBe(marked)
  expect(
    selectFeaturedArticle([recent, marked], Date.parse('2026-10-19T14:00:00Z'))
  ).toBe(recent)
})

it.each([
  [
    article('photo', {
      featuredImage: {
        node: {
          sourceUrl: 'https://cdn.noticiascol.com/noticia.jpg',
          mediaDetails: { width: 1200, height: 600 }
        }
      }
    }),
    'photographic'
  ],
  [article('missing'), 'traditional'],
  [article('null', { featuredImage: null }), 'traditional'],
  [
    article('empty', { featuredImage: { node: { sourceUrl: '' } } }),
    'traditional'
  ],
  [
    article('invalid', {
      featuredImage: { node: { sourceUrl: 'data:image/svg+xml,<svg/>' } }
    }),
    'traditional'
  ],
  [null, 'traditional']
])(
  'selects a deterministic opening treatment with a safe no-image fallback',
  (post, expected) => {
    expect(selectOpeningTreatment(post)).toBe(expected)
  }
)

it.each([
  undefined,
  { width: 1199, height: 900 },
  { width: 1200, height: 599 },
  { width: 1200, height: 0 },
  { width: NaN, height: 900 }
])(
  'keeps the existing opening when dimensions are insufficient (%s)',
  mediaDetails => {
    expect(
      selectOpeningTreatment(
        article('small', {
          featuredImage: {
            node: {
              sourceUrl: 'https://cdn.noticiascol.com/news.jpg',
              mediaDetails
            }
          }
        })
      )
    ).toBe('traditional')
  }
)

it('indexes descendants once and terminates even with a malformed cycle', () => {
  const categories: HomeCategory[] = [
    { id: '1', databaseId: 1, slug: 'zulia', name: 'Zulia', parentId: '3' },
    { id: '2', databaseId: 2, slug: 'col', name: 'COL', parentId: '1' },
    { id: '3', databaseId: 3, slug: 'cabimas', name: 'Cabimas', parentId: '2' },
    {
      id: '4',
      databaseId: 4,
      slug: 'nacionales',
      name: 'Nacionales',
      parentId: null
    }
  ]
  const index = getDescendantIds(categories)
  expect(index.get('zulia')).toEqual([1, 2, 3])
  expect(index.get('col')).toEqual([2, 3, 1])
  expect(index.get('nacionales')).toEqual([4])
})

it('lets the chronological latest list repeat stories while retaining deduplication within that list', () => {
  const first = article('shared')
  const result = composeHomeSections(
    {
      featured: null,
      sections: { zulia: [first], latest: [first, first, article('new')] },
      regions: [],
      errors: []
    },
    [
      { ...config[1] },
      {
        ...config[0],
        id: 'latest',
        title: 'Últimas publicaciones',
        position: 10,
        allowRepeatedArticles: true
      }
    ]
  )
  expect(result.map(s => s.articles.map(p => p.id))).toEqual([
    ['shared'],
    ['shared', 'new']
  ])
})

it.each(
  HOME_V2_SECTIONS.filter(section =>
    ['regional', 'lead_list'].includes(section.presentation)
  )
)(
  '$id keeps its newest story when the same article already leads the opening',
  section => {
    const recent = article('recent', { date: '2026-10-18T08:29:23' })
    const older = article('yesterday', { date: '2026-10-17T17:34:29' })
    const result = composeHomeSections(
      {
        featured: recent,
        sections: { opening: [recent], [section.id]: [recent, recent, older] },
        regions: [],
        errors: []
      },
      HOME_V2_SECTIONS
    ).find(module => module.id === section.id)!
    expect(result.articles.map(post => post.id)).toEqual([
      'recent',
      'yesterday'
    ])
  }
)
