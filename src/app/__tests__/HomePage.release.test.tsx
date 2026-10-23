import { render, screen } from '@testing-library/react'
import Page, { metadata, revalidate } from '../page'
import HomeEntry from '@components/HomeEntry'
import PublicHomeV2 from '@components/HomeV2/PublicHome'
import { HomeV2 } from '@components/HomeV2'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'
import type { HomeV2Data } from '@lib/homeV2/types'

jest.mock('@components/HomeEntry', () => ({
  __esModule: true,
  default: jest.fn(() => <main data-testid='legacy-home'>Home actual</main>)
}))
jest.mock('@components/Header', () => ({
  Header: () => <header>NoticiasCol</header>
}))
jest.mock('@components/HomeV2', () => ({
  HomeV2: jest.fn(() => <main data-testid='public-home-v2'>Home V2</main>)
}))
jest.mock('@lib/homeV2/getHomeV2Data', () => ({ getHomeV2Data: jest.fn() }))

const originalEnv = process.env
const healthy: HomeV2Data = {
  featured: null,
  sections: {},
  regions: [],
  errors: []
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env = {
    ...originalEnv,
    HOME_V2_PUBLIC_ENABLED: 'true',
    VERCEL: '1',
    VERCEL_ENV: 'production'
  }
  jest.mocked(getHomeV2Data).mockResolvedValue(healthy)
})
afterEach(() => {
  process.env = originalEnv
})

it('renders a single automatic V2 on the public root when enabled for the deployment', async () => {
  render(await PublicHomeV2())
  expect(screen.getAllByRole('main')).toHaveLength(1)
  expect(screen.getByTestId('public-home-v2')).toBeInTheDocument()
  expect(screen.getByRole('banner')).toHaveTextContent('NoticiasCol')
  expect(HomeEntry).not.toHaveBeenCalled()
  expect(jest.mocked(HomeV2).mock.calls[0][0]).toEqual({
    data: healthy,
    publicRegionApi: true
  })
})

it('renders only the deployment-selected server entry, independently of QA flags', () => {
  delete process.env.HOME_V2_PUBLIC_ENABLED
  process.env.HOME_V2_PREVIEW_ENABLED = 'true'
  process.env.HOME_V2_PREVIEW_COMPARE_OPENINGS = 'true'
  render(Page())
  expect(screen.getByTestId('legacy-home')).toBeInTheDocument()
  expect(screen.queryByTestId('public-home-v2')).not.toBeInTheDocument()
  expect(getHomeV2Data).not.toHaveBeenCalled()
})

it('retains the public canonical metadata and existing ISR declaration', () => {
  expect(metadata.alternates).toMatchObject({
    canonical: 'https://www.noticiascol.com/'
  })
  expect(revalidate).toBe(7200)
})

it.each(['taxonomies', 'opening', 'sucesos'])(
  'rejects failed %s data so ISR cannot replace a healthy Home with a partial page',
  async module => {
    jest.mocked(getHomeV2Data).mockResolvedValue({
      ...healthy,
      errors: [module]
    })
    await expect(PublicHomeV2()).rejects.toThrow(
      'Home V2 editorial data unavailable'
    )
    expect(HomeV2).not.toHaveBeenCalled()
  }
)

it('keeps the fallback entry independent of the V2 data source', () => {
  process.env.HOME_V2_PUBLIC_ENABLED = 'false'
  jest.mocked(getHomeV2Data).mockRejectedValue(new Error('CMS unavailable'))
  render(Page())
  expect(screen.getAllByRole('main')).toHaveLength(1)
  expect(screen.getByTestId('legacy-home')).toBeInTheDocument()
  expect(getHomeV2Data).not.toHaveBeenCalled()
})
