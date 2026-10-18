import { normalizeImageUrl } from '@lib/utils/normalizeImageUrl'
import { GET } from '../route'
import { getTursoViews, withTursoRetry } from '@lib/turso'

jest.mock('@lib/turso', () => ({
  getTursoViews: jest.fn(),
  withTursoRetry: jest.fn(operation => operation())
}))

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn()
}))

class ResponseMock {
  status: number
  headers: Headers
  private body: string

  constructor(body: string, init?: { status?: number; headers?: HeadersInit }) {
    this.status = init?.status ?? 200
    this.headers = new Headers(init?.headers)
    this.body = body
  }

  static json(
    body: unknown,
    init?: { status?: number; headers?: HeadersInit }
  ) {
    return new ResponseMock(JSON.stringify(body), init)
  }

  async json() {
    return JSON.parse(this.body)
  }
}

let originalResponse: typeof Response

beforeAll(() => {
  originalResponse = global.Response
  global.Response = ResponseMock as never
})

afterAll(() => {
  global.Response = originalResponse
})

describe('normalizeImageUrl', () => {
  it('extracts a concrete URL from legacy srcset data', () => {
    expect(
      normalizeImageUrl(
        'https://cdn.noticiascol.com/post-373x210.webp 373w, https://cdn.noticiascol.com/post.webp 1024w'
      )
    ).toBe('https://cdn.noticiascol.com/post-373x210.webp')
  })

  it('keeps a single image URL unchanged', () => {
    expect(normalizeImageUrl('https://cdn.noticiascol.com/post.webp')).toBe(
      'https://cdn.noticiascol.com/post.webp'
    )
  })
})

describe('GET /api/most-visited', () => {
  const execute = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(getTursoViews).mockReturnValue({ execute } as never)
  })

  it('caches even an empty public ranking at the CDN', async () => {
    execute.mockResolvedValue({ rows: [] })

    const response = await GET({
      url: 'https://www.noticiascol.com/api/most-visited?days=7'
    } as never)

    expect(withTursoRetry).toHaveBeenCalledTimes(1)
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=0, s-maxage=21600, stale-while-revalidate=3600'
    )
    await expect(response.json()).resolves.toEqual({ posts: [] })
  })
})

it('limits a dated Home V2 ranking before grouping while keeping the default endpoint unchanged', async () => {
  const execute = jest.fn().mockResolvedValue({ rows: [] })
  jest.mocked(getTursoViews).mockReturnValue({ execute } as never)
  const response = await GET({
    url: 'https://www.noticiascol.com/api/most-visited?days=7&publicationDay=2026-10-18'
  } as never)
  expect(response.status).toBe(200)
  expect(execute.mock.calls[0][0].sql).toContain('post_slug LIKE ?')
  expect(execute.mock.calls[0][0].args).toEqual([
    7,
    '/2026/10/18/%',
    '%/2026/10/18/%',
    5
  ])
  const invalid = await GET({
    url: 'https://www.noticiascol.com/api/most-visited?publicationDay=2026-02-30'
  } as never)
  expect(invalid.status).toBe(400)
  expect(execute).toHaveBeenCalledTimes(1)
})
