import { fetcher } from '../utils'

describe('utils.fetcher', () => {
  test('fetches JSON with no-store cache', async () => {
    const json = jest.fn().mockResolvedValue({ ok: true })
    ;(global.fetch as any) = jest.fn().mockResolvedValue({ json })
    const data = await fetcher('/api/test')
    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      cache: 'no-store'
    })
    expect(data).toEqual({ ok: true })
  })
})
