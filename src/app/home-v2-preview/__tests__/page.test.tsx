import Page, { generateMetadata } from '../page'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'
import { HOME_PAGE_TITLE } from '@lib/constants'

jest.mock('@lib/homeV2/getHomeV2Data', () => ({ getHomeV2Data: jest.fn() }))
jest.mock('@components/Header', () => ({ Header: () => null }))
jest.mock('@components/HomeV2', () => ({ HomeV2: () => null }))
jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('404')
  }
}))
it('rejects a disabled preview before loading editorial data', async () => {
  const prior = process.env.HOME_V2_PREVIEW_ENABLED
  process.env.HOME_V2_PREVIEW_ENABLED = 'false'
  try {
    await expect(Page()).rejects.toThrow('404')
    expect(getHomeV2Data).not.toHaveBeenCalled()
  } finally {
    if (prior === undefined) delete process.env.HOME_V2_PREVIEW_ENABLED
    else process.env.HOME_V2_PREVIEW_ENABLED = prior
  }
})

it('preserves the exact root title in a local performance comparison', () => {
  const prior = process.env
  process.env = {
    ...prior,
    HOME_V2_PREVIEW_ENABLED: 'true',
    HOME_V2_PERFORMANCE_AUDIT: 'true',
    VERCEL: '',
    VERCEL_ENV: ''
  }
  try {
    expect(generateMetadata().title).toEqual({ absolute: HOME_PAGE_TITLE })
  } finally {
    process.env = prior
  }
})
