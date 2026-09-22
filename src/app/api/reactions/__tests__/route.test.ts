/* eslint-disable @typescript-eslint/unbound-method */
import { GET, POST } from '../route'
import { tursoDb } from '@lib/db/turso'
import * as Sentry from '@sentry/nextjs'

jest.mock('@lib/db/turso', () => ({
  tursoDb: { select: jest.fn(), transaction: jest.fn() }
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
  let select: jest.Mock
  let transaction: jest.Mock
  let where: jest.Mock
  let update: jest.Mock
  let updateWhere: jest.Mock
  let insert: jest.Mock
  let onConflictDoUpdate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    select = tursoDb.select as unknown as jest.Mock
    transaction = tursoDb.transaction as unknown as jest.Mock
    where = jest.fn()
    select.mockReturnValue({ from: jest.fn().mockReturnValue({ where }) })

    updateWhere = jest.fn().mockResolvedValue(undefined)
    update = jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({ where: updateWhere })
    })
    onConflictDoUpdate = jest.fn().mockResolvedValue(undefined)
    insert = jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({ onConflictDoUpdate })
    })
    transaction.mockImplementation(async callback =>
      callback({ update, insert })
    )
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
      where.mockResolvedValueOnce([])
      const res = await GET(getReq('/foo/bar'))
      expect(res.status).toBe(200)
      const { counts } = await res.json()
      expect(counts.love).toBe(0)
      expect(counts.cry).toBe(0)
    })

    it('merges stored rows into the counts map', async () => {
      where.mockResolvedValueOnce(
        [
          ['love', 3],
          ['cry', 7]
        ].map(([reaction, count]) => ({ reaction, count }))
      )
      const res = await GET(getReq('/foo/bar'))
      const { counts } = await res.json()
      expect(counts.love).toBe(3)
      expect(counts.cry).toBe(7)
      expect(counts.angry).toBe(0)
    })

    it('reports DB errors to Sentry and returns 500', async () => {
      const err = new Error('boom')
      where.mockRejectedValueOnce(err)
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
      where.mockResolvedValueOnce([{ reaction: 'love', count: 1 }])

      const res = await POST(postReq({ slug: '/x', reaction: 'love' }))
      expect(res.status).toBe(200)
      expect(transaction).toHaveBeenCalledTimes(1)
      expect(insert).toHaveBeenCalledTimes(1)
      expect(onConflictDoUpdate).toHaveBeenCalledTimes(1)

      const { counts } = await res.json()
      expect(counts.love).toBe(1)
    })

    it('persists a valid postDate as ISO on insert', async () => {
      where.mockResolvedValueOnce([{ reaction: 'love', count: 1 }])

      await POST(
        postReq({
          slug: '/x',
          reaction: 'love',
          postDate: '2026-09-01T10:00:00Z'
        })
      )

      expect(onConflictDoUpdate).toHaveBeenCalledTimes(1)
    })

    it('drops malformed postDate silently (null in args)', async () => {
      where.mockResolvedValueOnce([{ reaction: 'love', count: 1 }])

      await POST(
        postReq({ slug: '/x', reaction: 'love', postDate: 'not-a-date' })
      )

      expect(onConflictDoUpdate).toHaveBeenCalledTimes(1)
    })

    it('swaps prev → new when changing vote (batch has 2 stmts)', async () => {
      where.mockResolvedValueOnce([
        { reaction: 'love', count: 0 },
        { reaction: 'angry', count: 1 }
      ])

      const res = await POST(
        postReq({ slug: '/x', reaction: 'angry', prev: 'love' })
      )
      expect(res.status).toBe(200)
      expect(update).toHaveBeenCalledTimes(1)
      expect(updateWhere).toHaveBeenCalledTimes(1)
      expect(insert).toHaveBeenCalledTimes(1)
    })

    it('skips the decrement when prev equals reaction', async () => {
      where.mockResolvedValueOnce([{ reaction: 'love', count: 5 }])

      await POST(postReq({ slug: '/x', reaction: 'love', prev: 'love' }))
      expect(update).not.toHaveBeenCalled()
      expect(insert).toHaveBeenCalledTimes(1)
    })

    it('reports DB errors to Sentry and returns 500', async () => {
      const err = new Error('db down')
      transaction.mockRejectedValueOnce(err)
      const res = await POST(postReq({ slug: '/x', reaction: 'love' }))
      expect(res.status).toBe(500)
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })
  })
})
