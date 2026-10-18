import { getHomeV2Region } from '@app/actions/getHomeV2Region'
import { getHomeV2Data } from '../getHomeV2Data'
import { postsClient } from '@lib/api'

jest.mock('../getHomeV2Data', () => ({ getHomeV2Data: jest.fn() }))
jest.mock('@lib/api', () => ({ postsClient: { getHomeModules: jest.fn() } }))
jest.mock('next/cache', () => ({
  unstable_cache: (load: () => Promise<unknown>) => load
}))
const original = { ...process.env }
beforeEach(() => {
  jest.clearAllMocks()
  process.env = {
    ...original,
    HOME_V2_PREVIEW_ENABLED: 'true',
    HOME_V2_EXPERIMENT_ENABLED: 'false',
    VERCEL: '',
    VERCEL_ENV: ''
  }
})
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
it('uses the selected descendants and excludes the featured story from filtered results', async () => {
  const feature = {
    id: 'p1',
    uri: '/destacada/',
    title: 'Noticia destacada de portada',
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
    modules: { zulia: [feature, story] },
    hasErrors: false
  })
  await expect(getHomeV2Region('zulia')).resolves.toEqual({
    ok: true,
    articles: [story]
  })
  expect(request).toHaveBeenCalledWith([
    { id: 'zulia', categoryIds: [52, 10], limit: 11 }
  ])
})
