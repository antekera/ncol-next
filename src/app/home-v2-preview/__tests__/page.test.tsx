import Page from '../page'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'

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
