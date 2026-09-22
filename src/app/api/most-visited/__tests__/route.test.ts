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
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
    )
    await expect(response.json()).resolves.toEqual({ posts: [] })
  })
})
