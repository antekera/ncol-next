import { getHomeV2Region } from '@app/actions/getHomeV2Region'
import { getHomeV2Data, getHomeV2Taxonomies } from '../getHomeV2Data'
import { postsClient } from '@lib/api'
import { unstable_cache } from 'next/cache'

jest.mock('../getHomeV2Data', () => ({
  getHomeV2Data: jest.fn(),
  getHomeV2Taxonomies: jest.fn()
}))
jest.mock('@lib/api', () => ({ postsClient: { getHomeModules: jest.fn() } }))
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((load: () => Promise<unknown>) => load)
}))
const original = { ...process.env }
const categories = [
  { id: 'c52', databaseId: 52, slug: 'zulia', name: 'Zulia', parentId: null },
  {
    id: 'c10',
    databaseId: 10,
    slug: 'cabimas',
    name: 'Cabimas',
    parentId: 'c52'
  },
  {
    id: 'c99',
    databaseId: 99,
    slug: 'nacionales',
    name: 'Nacionales',
    parentId: null
  }
]
beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers().setSystemTime(new Date('2026-10-18T15:00:00Z'))
  process.env = {
    ...original,
    HOME_V2_PREVIEW_ENABLED: 'true',
    HOME_V2_PUBLIC_ENABLED: 'false',
    VERCEL: '',
    VERCEL_ENV: ''
  }
})
afterEach(() => jest.useRealTimers())
afterAll(() => {
  process.env = original
})
it('does not read CMS data with preview/public launch off, even with the old experiment flag', async () => {
  process.env.HOME_V2_PREVIEW_ENABLED = 'false'
  process.env.HOME_V2_EXPERIMENT_ENABLED = 'true'
  await expect(getHomeV2Region('zulia')).resolves.toEqual({
    ok: false,
    articles: []
  })
  expect(getHomeV2Data).not.toHaveBeenCalled()
  expect(getHomeV2Taxonomies).not.toHaveBeenCalled()
})
it('bounds requests to public regions already present in the shared taxonomy', async () => {
  const request = jest.spyOn(postsClient, 'getHomeModules')
  jest.mocked(getHomeV2Taxonomies).mockResolvedValue(categories)
  await expect(getHomeV2Region('unknown')).resolves.toEqual({
    ok: false,
    articles: []
  })
  expect(request).not.toHaveBeenCalled()
})
it('rejects a known category outside Zulia without querying articles', async () => {
  const request = jest.spyOn(postsClient, 'getHomeModules')
  jest.mocked(getHomeV2Taxonomies).mockResolvedValue(categories)
  await expect(getHomeV2Region('nacionales')).resolves.toEqual({
    ok: false,
    articles: []
  })
  expect(request).not.toHaveBeenCalled()
  expect(getHomeV2Data).not.toHaveBeenCalled()
})
it('keeps taxonomy failures recoverable without falling back to full Home', async () => {
  const request = jest.spyOn(postsClient, 'getHomeModules')
  jest
    .mocked(getHomeV2Taxonomies)
    .mockRejectedValue(new Error('CMS unavailable'))
  await expect(getHomeV2Region('zulia')).resolves.toEqual({
    ok: false,
    articles: []
  })
  expect(request).not.toHaveBeenCalled()
  expect(getHomeV2Data).not.toHaveBeenCalled()
})
it('queries only the selected municipality and its descendants', async () => {
  jest.mocked(getHomeV2Taxonomies).mockResolvedValue([
    ...categories,
    {
      id: 'c11',
      databaseId: 11,
      slug: 'parroquia',
      name: 'Parroquia',
      parentId: 'c10'
    }
  ])
  const request = jest.spyOn(postsClient, 'getHomeModules').mockResolvedValue({
    modules: { zulia: [] },
    hasErrors: false
  })
  await expect(getHomeV2Region('cabimas')).resolves.toEqual({
    ok: true,
    articles: []
  })
  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith([
    { id: 'zulia', categoryIds: [10, 11], limit: 11 }
  ])
  expect(getHomeV2Data).not.toHaveBeenCalled()
})
it.each(['preview', 'public'])(
  'keeps the newest regional story and descendants in %s',
  async mode => {
    if (mode === 'public') {
      process.env.HOME_V2_PREVIEW_ENABLED = 'false'
      process.env.HOME_V2_PUBLIC_ENABLED = 'true'
      process.env.VERCEL = '1'
      process.env.VERCEL_ENV = 'production'
    }
    const feature = {
      id: 'p1',
      uri: '/destacada/',
      title: 'Noticia destacada de portada',
      date: '2026-10-18T08:00:00',
      categories: { edges: [] }
    }
    const story = {
      ...feature,
      id: 'p2',
      uri: '/region/',
      title: 'Noticia regional diferente'
    }
    jest.mocked(getHomeV2Taxonomies).mockResolvedValue(categories)
    const request = jest
      .spyOn(postsClient, 'getHomeModules')
      .mockResolvedValue({
        modules: {
          zulia: [
            feature,
            story,
            {
              ...story,
              id: 'yesterday',
              uri: '/yesterday/',
              date: '2026-10-17T23:59:59'
            },
            {
              ...story,
              id: 'expired',
              title: 'Jornada del 17 de octubre de 2026'
            }
          ]
        },
        hasErrors: false
      })
    await expect(getHomeV2Region('zulia')).resolves.toEqual({
      ok: true,
      articles: [
        feature,
        story,
        {
          ...story,
          id: 'yesterday',
          uri: '/yesterday/',
          date: '2026-10-17T23:59:59'
        }
      ]
    })
    expect(request).toHaveBeenCalledWith([
      {
        id: 'zulia',
        categoryIds: [52, 10],
        limit: 11
      }
    ])
    expect(getHomeV2Data).not.toHaveBeenCalled()
    expect(
      jest.mocked(unstable_cache).mock.calls[0][2]?.revalidate
    ).toBeLessThanOrEqual(5 * 60)
  }
)
