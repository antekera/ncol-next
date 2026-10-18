import { getHomeV2Region } from '@app/actions/getHomeV2Region'
import { getHomeV2Data } from '../getHomeV2Data'
import { postsClient } from '@lib/api'
import { unstable_cache } from 'next/cache'

jest.mock('../getHomeV2Data', () => ({ getHomeV2Data: jest.fn() }))
jest.mock('@lib/api', () => ({ postsClient: { getHomeModules: jest.fn() } }))
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((load: () => Promise<unknown>) => load)
}))
const original = { ...process.env }
beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers().setSystemTime(new Date('2026-10-18T15:00:00Z'))
  process.env = {
    ...original,
    HOME_V2_PREVIEW_ENABLED: 'true',
    HOME_V2_EXPERIMENT_ENABLED: 'false',
    VERCEL: '',
    VERCEL_ENV: ''
  }
})
afterEach(() => jest.useRealTimers())
afterAll(() => {
  process.env = original
})
it('does not read CMS data while the local preview and experiment are disabled', async () => {
  process.env.HOME_V2_PREVIEW_ENABLED = 'false'
  await expect(getHomeV2Region('zulia')).resolves.toEqual({
    ok: false,
    articles: []
  })
  expect(getHomeV2Data).not.toHaveBeenCalled()
})
it('bounds requests to public regions already present in the shared taxonomy', async () => {
  const request = jest.spyOn(postsClient, 'getHomeModules')
  jest.mocked(getHomeV2Data).mockResolvedValue({
    featured: null,
    sections: {},
    regions: [],
    errors: []
  })
  await expect(getHomeV2Region('unknown')).resolves.toEqual({
    ok: false,
    articles: []
  })
  expect(request).not.toHaveBeenCalled()
})
it('keeps the newest regional story even when featured and uses the selected descendants', async () => {
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
  jest.mocked(getHomeV2Data).mockResolvedValue({
    featured: feature,
    sections: {},
    regions: [
      {
        id: 'c52',
        databaseId: 52,
        slug: 'zulia',
        name: 'Zulia',
        parentId: null
      },
      {
        id: 'c10',
        databaseId: 10,
        slug: 'cabimas',
        name: 'Cabimas',
        parentId: 'c52'
      }
    ],
    errors: []
  })
  const request = jest.spyOn(postsClient, 'getHomeModules').mockResolvedValue({
    modules: {
      zulia: [
        { ...story, id: 'yesterday', date: '2026-10-17T23:59:59' },
        feature,
        story
      ]
    },
    hasErrors: false
  })
  await expect(getHomeV2Region('zulia')).resolves.toEqual({
    ok: true,
    articles: [feature, story]
  })
  expect(request).toHaveBeenCalledWith([
    {
      id: 'zulia',
      categoryIds: [52, 10],
      limit: 11,
      publicationDay: '2026-10-18'
    }
  ])
  expect(
    jest.mocked(unstable_cache).mock.calls[0][2]?.revalidate
  ).toBeLessThanOrEqual(5 * 60)
})
