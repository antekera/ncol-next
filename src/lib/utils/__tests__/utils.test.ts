import { fetcher } from '../utils'

describe('utils.fetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as any) = jest.fn()
  })

  test('fetches JSON with no-store cache', async () => {
    const json = jest.fn().mockResolvedValue({ success: true })
    const headers = { get: jest.fn().mockReturnValue('application/json') }
    ;(global.fetch as any).mockResolvedValue({ ok: true, json, headers })

    const data = await fetcher('/api/test')

    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      cache: 'no-store'
    })
    expect(data).toEqual({ success: true })
  })

  test('throws on XML response', async () => {
    const text = jest
      .fn()
      .mockResolvedValue(
        '<?xml version="1.0" encoding="UTF-8"?><Error>...</Error>'
      )
    const headers = { get: jest.fn().mockReturnValue('application/xml') }
    ;(global.fetch as any).mockResolvedValue({ ok: true, text, headers })

    await expect(fetcher('/api/test')).rejects.toThrow(
      'Received XML error response instead of JSON from /api/test'
    )
  })

  test('throws on non-JSON content type', async () => {
    const text = jest.fn().mockResolvedValue('Some text response')
    const headers = { get: jest.fn().mockReturnValue('text/plain') }
    ;(global.fetch as any).mockResolvedValue({ ok: true, text, headers })

    await expect(fetcher('/api/test')).rejects.toThrow(
      'Unexpected content-type "text/plain" from /api/test'
    )
  })
})
