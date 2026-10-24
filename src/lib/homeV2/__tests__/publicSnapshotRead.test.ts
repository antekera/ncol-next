/** @jest-environment node */
import { categoriesClient, postsClient } from '@lib/api'
import { getPublicHomeSnapshot } from '../publicSnapshot'

jest.mock('@lib/api', () => ({
  categoriesClient: { getHomeTaxonomyPage: jest.fn() },
  postsClient: { getHomeModules: jest.fn() }
}))
jest.mock('../publicSnapshot', () => ({ getPublicHomeSnapshot: jest.fn() }))
jest.mock('next/cache', () => ({ unstable_cache: (load: unknown) => load }))
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (load: unknown) => load
}))
const original = process.env
beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers().setSystemTime(new Date('2026-10-19T15:00:00Z'))
  process.env = {
    ...original,
    HOME_V2_PUBLIC_ENABLED: 'true',
    HOME_V2_DURABLE_CACHE_ENABLED: 'true'
  }
})
afterEach(() => {
  process.env = original
  jest.useRealTimers()
})

it('applies title expiry after the shared read, preserving old undated news without taxonomy or CMS calls', async () => {
  const ordinary = {
    id: 'ordinary',
    uri: '/ordinary/',
    title: 'Noticia sin vencimiento',
    date: '2021-01-01T00:00:00Z',
    categories: { edges: [{ node: { slug: 'zulia', name: 'Zulia' } }] }
  }
  const expired = {
    ...ordinary,
    id: 'expired',
    uri: '/expired/',
    title: 'Jornada del 18 de octubre'
  }
  jest.mocked(getPublicHomeSnapshot).mockResolvedValue({
    revision: 1,
    fetchedAt: Date.parse('2026-10-18T15:00:00Z'),
    data: {
      featured: expired,
      openingCategorySlugs: ['zulia'],
      sections: { opening: [expired, ordinary], latest: [expired, ordinary] },
      regions: [],
      errors: []
    }
  })
  await jest.isolateModulesAsync(async () => {
    const { getHomeV2Data } = await import('../getHomeV2Data')
    const data = await getHomeV2Data()
    expect(data.featured?.id).toBe('ordinary')
    expect(data.sections.latest.map(post => post.id)).toEqual(['ordinary'])
  })
  expect(
    jest.spyOn(categoriesClient, 'getHomeTaxonomyPage')
  ).not.toHaveBeenCalled()
  expect(jest.spyOn(postsClient, 'getHomeModules')).not.toHaveBeenCalled()
})

it('does not turn unavailable storage into a CMS query for each visitor', async () => {
  jest
    .mocked(getPublicHomeSnapshot)
    .mockRejectedValue(new Error('snapshot unavailable'))
  await jest.isolateModulesAsync(async () => {
    const { getHomeV2Data } = await import('../getHomeV2Data')
    await expect(getHomeV2Data()).rejects.toThrow('snapshot unavailable')
  })
  expect(
    jest.spyOn(categoriesClient, 'getHomeTaxonomyPage')
  ).not.toHaveBeenCalled()
  expect(jest.spyOn(postsClient, 'getHomeModules')).not.toHaveBeenCalled()
})
