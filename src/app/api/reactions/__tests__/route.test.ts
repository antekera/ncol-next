/* eslint-disable @typescript-eslint/unbound-method */
import { GET, POST } from '../route'
import { tursoViews } from '@lib/turso'
import * as Sentry from '@sentry/nextjs'

jest.mock('@lib/turso', () => ({
  tursoViews: { execute: jest.fn(), batch: jest.fn() }
}))

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn()
}))

class MockResponse {
  status: number
  body: any
  constructor(body: any, init?: any) {
    this.body = body
    this.status = init?.status || 200
  }
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
  static json(data: any) {
    return new MockResponse(data, { status: 200 })
  }
}
global.Response = global.Response || (MockResponse as any)
;(MockResponse as any).json = MockResponse.json

describe('/api/reactions', () => {
  let execute: jest.Mock
  let batch: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    execute = tursoViews.execute as unknown as jest.Mock
    batch = tursoViews.batch as unknown as jest.Mock
    execute.mockReset()
    batch.mockReset()
  })

  function postReq(body: any) {
    return { json: jest.fn().mockResolvedValue(body) } as any
  }

  function getReq(slug?: string | null) {
    return {
      nextUrl: {
        searchParams: {
          get: (key: string) =>
            key === 'slug' && slug !== undefined ? slug : null
        }
      }
    } as any
  }

  describe('GET', () => {
    it('rejects when slug is missing', async () => {
      const res = await GET(getReq(null))
      expect(res.status).toBe(400)
    })

    it('returns zero-filled counts when no rows exist', async () => {
      execute.mockResolvedValueOnce({ rows: [] })
      const res = await GET(getReq('/foo/bar'))
      expect(res.status).toBe(200)
      const { counts } = await res.json()
      expect(counts.love).toBe(0)
      expect(counts.cry).toBe(0)
    })

    it('merges stored rows into the counts map', async () => {
      execute.mockResolvedValueOnce({
        rows: [
          ['love', 3],
          ['cry', 7]
        ]
      })
      const res = await GET(getReq('/foo/bar'))
      const { counts } = await res.json()
      expect(counts.love).toBe(3)
      expect(counts.cry).toBe(7)
      expect(counts.angry).toBe(0)
    })

    it('reports DB errors to Sentry and returns 500', async () => {
      const err = new Error('boom')
      execute.mockRejectedValueOnce(err)
      const res = await GET(getReq('/foo/bar'))
      expect(res.status).toBe(500)
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })
  })

  describe('POST', () => {
    it('rejects invalid JSON', async () => {
      const err = new Error('bad json')
      const res = await POST({ json: jest.fn().mockRejectedValue(err) } as any)
      expect(res.status).toBe(400)
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })

    it('rejects missing slug', async () => {
      const res = await POST(postReq({ reaction: 'love' }))
      expect(res.status).toBe(400)
    })

    it('rejects unknown reaction keys', async () => {
      const res = await POST(postReq({ slug: '/x', reaction: 'nope' }))
      expect(res.status).toBe(400)
    })

    it('rejects unknown prev keys', async () => {
      const res = await POST(
        postReq({ slug: '/x', reaction: 'love', prev: 'nope' })
      )
      expect(res.status).toBe(400)
    })

    it('increments the chosen reaction (no prev)', async () => {
      batch.mockResolvedValueOnce(undefined)
      execute.mockResolvedValueOnce({ rows: [['love', 1]] })

      const res = await POST(postReq({ slug: '/x', reaction: 'love' }))
      expect(res.status).toBe(200)
      expect(batch).toHaveBeenCalledTimes(1)
      const [statements, mode] = batch.mock.calls[0]
      expect(mode).toBe('write')
      expect(statements).toHaveLength(1)
      expect(statements[0].sql).toMatch(/INSERT INTO reactions/i)

      const { counts } = await res.json()
      expect(counts.love).toBe(1)
    })

    it('swaps prev → new when changing vote (batch has 2 stmts)', async () => {
      batch.mockResolvedValueOnce(undefined)
      execute.mockResolvedValueOnce({
        rows: [
          ['love', 0],
          ['angry', 1]
        ]
      })

      const res = await POST(
        postReq({ slug: '/x', reaction: 'angry', prev: 'love' })
      )
      expect(res.status).toBe(200)
      const [statements] = batch.mock.calls[0]
      expect(statements).toHaveLength(2)
      expect(statements[0].sql).toMatch(/UPDATE reactions/i)
      expect(statements[0].sql).toMatch(/MAX\(count - 1, 0\)/i)
      expect(statements[1].sql).toMatch(/INSERT INTO reactions/i)
    })

    it('skips the decrement when prev equals reaction', async () => {
      batch.mockResolvedValueOnce(undefined)
      execute.mockResolvedValueOnce({ rows: [['love', 5]] })

      await POST(postReq({ slug: '/x', reaction: 'love', prev: 'love' }))
      const [statements] = batch.mock.calls[0]
      expect(statements).toHaveLength(1)
    })

    it('reports DB errors to Sentry and returns 500', async () => {
      const err = new Error('db down')
      batch.mockRejectedValueOnce(err)
      const res = await POST(postReq({ slug: '/x', reaction: 'love' }))
      expect(res.status).toBe(500)
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })
  })
})
