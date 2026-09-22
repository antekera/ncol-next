import { ReactionsClient } from '../ReactionsClient'
import type { HttpClient, HttpResponse } from '@lib/httpClient'

type Fake = { get: jest.Mock; post: jest.Mock }

const makeClient = (fake: Fake) =>
  new ReactionsClient(fake as unknown as HttpClient)

const ok = <T>(data: T): HttpResponse<T> => ({ data, status: 200 })
const err = (status: number, message = 'boom'): HttpResponse<null> => ({
  data: null,
  status,
  error: { message }
})

describe('ReactionsClient', () => {
  test('getCounts unwraps counts on 200', async () => {
    const client = makeClient({
      get: jest.fn().mockResolvedValue(ok({ counts: { love: 3 } })),
      post: jest.fn()
    })
    await expect(client.getCounts('/x')).resolves.toEqual({ love: 3 })
  })

  test('getCounts throws when HttpClient reports an error (no rejection)', async () => {
    // HttpClient never throws on HTTP errors — it resolves with { error }.
    // The client must normalize that into a real throw so callers can rely
    // on try/catch to detect failure.
    const client = makeClient({
      get: jest.fn().mockResolvedValue(err(500)),
      post: jest.fn()
    })
    await expect(client.getCounts('/x')).rejects.toThrow()
  })

  test('vote forwards slug/reaction/prev/postDate to POST', async () => {
    const post = jest.fn().mockResolvedValue(ok({ counts: { love: 1 } }))
    const client = makeClient({ get: jest.fn(), post })

    await client.vote({
      slug: '/x',
      reaction: 'love',
      prev: 'angry',
      postDate: '2026-09-01'
    })

    expect(post).toHaveBeenCalledWith('/api/reactions/', {
      slug: '/x',
      reaction: 'love',
      prev: 'angry',
      postDate: '2026-09-01'
    })
  })

  test('vote throws when HttpClient returns an error status', async () => {
    const client = makeClient({
      get: jest.fn(),
      post: jest.fn().mockResolvedValue(err(429, 'rate limited'))
    })
    await expect(client.vote({ slug: '/x', reaction: 'love' })).rejects.toThrow(
      /rate limited/
    )
  })
})
