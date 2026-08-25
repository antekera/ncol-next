/* eslint-disable @typescript-eslint/unbound-method */
import { POST } from '../route'
import { getTursoViews } from '@lib/turso'
import * as Sentry from '@sentry/nextjs'

jest.mock('@lib/turso', () => ({
  getTursoViews: jest.fn()
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

describe('/api/views', () => {
  let execute: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    execute = jest.fn()
    ;(getTursoViews as jest.Mock).mockReturnValue({ execute })
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  function createMockRequest(body: any) {
    return {
      json: jest.fn().mockResolvedValue(body)
    } as any
  }

  it('handles invalid json payloads and reports to Sentry', async () => {
    const error = new Error('Invalid JSON')
    const req = {
      json: jest.fn().mockRejectedValue(error)
    } as any

    const response = await POST(req)

    expect(response.status).toBe(400)
    expect(Sentry.captureException).toHaveBeenCalledWith(error)
    expect(await response.json()).toEqual(
      expect.objectContaining({ error: 'Invalid or missing JSON body' })
    )
  })

  it('rejects if slug is missing or not a string', async () => {
    const req = createMockRequest({
      count: 1,
      title: 'Post Title',
      featuredImage: 'http://example.com/image.jpg'
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Invalid payload types or missing fields'
    })
  })

  it('rejects if count is missing, not a number, or negative', async () => {
    const req = createMockRequest({
      slug: 'my-post',
      title: 'Post Title',
      featuredImage: 'http://example.com/image.jpg'
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Invalid payload types or missing fields'
    })
  })

  it('rejects if title is missing or not a string', async () => {
    const req = createMockRequest({
      slug: 'my-post',
      count: 1,
      featuredImage: 'http://example.com/image.jpg'
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('rejects if featuredImage is missing or not a string', async () => {
    const req = createMockRequest({
      slug: 'my-post',
      count: 1,
      title: 'Post Title'
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('successfully increments count and returns updated count', async () => {
    const req = createMockRequest({
      slug: 'my-valid-post',
      title: 'My Valid Post',
      featuredImage: 'http://example.com/image.jpg',
      count: 1
    })

    execute.mockResolvedValueOnce({ rows: [[15]] })

    const response = await POST(req)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toEqual({ count: 15 })

    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('returns 404 if post is not found after insertion', async () => {
    const req = createMockRequest({
      slug: 'my-valid-post',
      title: 'My Valid Post',
      featuredImage: 'http://example.com/image.jpg',
      count: 1
    })

    execute.mockResolvedValueOnce({ rows: [] })

    const response = await POST(req)
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Post not found' })
  })

  it('handles database errors gracefully and captures to Sentry', async () => {
    const req = createMockRequest({
      slug: 'my-valid-post',
      title: 'My Valid Post',
      featuredImage: 'http://example.com/image.jpg',
      count: 1
    })

    const dbError = new Error('Database connection failed')
    execute.mockRejectedValueOnce(dbError)

    const response = await POST(req)
    expect(response.status).toBe(500)
    expect(Sentry.captureException).toHaveBeenCalledWith(dbError)

    expect(await response.json()).toEqual(
      expect.objectContaining({ error: 'Database error' })
    )
  })
})
