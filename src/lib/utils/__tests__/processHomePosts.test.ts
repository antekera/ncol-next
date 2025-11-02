import { processHomePosts } from '../processHomePosts'

jest.mock('@lib/utils/isPostPublishedWithinLastDay', () => ({
  isPostPublishedWithinLastDay: jest.fn()
}))

const { isPostPublishedWithinLastDay } = jest.requireMock(
  '@lib/utils/isPostPublishedWithinLastDay'
)

describe('processHomePosts', () => {
  const makePosts = (taggedFirst = true) => {
    const taggedPost = {
      id: '1',
      tags: { edges: [{ node: { slug: 'en-portada' } }] }
    }
    const fallbackPost = { id: '2', tags: { edges: [] } }
    const edges = taggedFirst
      ? [{ node: taggedPost }, { node: fallbackPost }]
      : [{ node: fallbackPost }, { node: taggedPost }]
    return {
      edges,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: ''
      }
    } as any
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns tagged post as cover when published within last day', () => {
    ;(isPostPublishedWithinLastDay as jest.Mock).mockReturnValue(true)
    const posts = makePosts()
    const res = processHomePosts(posts)
    expect(res.cover?.id).toBe('1')
  })

  it('falls back to first post when tagged post is not recent', () => {
    ;(isPostPublishedWithinLastDay as jest.Mock).mockReturnValue(false)
    const posts = makePosts(false)
    const res = processHomePosts(posts)
    expect(res.cover?.id).toBe('2')
  })
})
