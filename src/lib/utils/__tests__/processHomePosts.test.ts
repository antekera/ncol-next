import { processHomePosts } from '../processHomePosts'

jest.mock('@lib/utils/isPostPublishedWithinLastDay', () => ({
  isPostPublishedWithinLastDay: jest.fn()
}))

const { isPostPublishedWithinLastDay } = jest.requireMock(
  '@lib/utils/isPostPublishedWithinLastDay'
)

describe('processHomePosts', () => {
  const makePosts = (taggedFirst = true) => {
    const date = new Date().toISOString()
    const taggedPost = {
      id: '1',
      customFields: { noticiadestacada: true },
      date
    }
    const fallbackPost = {
      id: '2',
      customFields: { noticiadestacada: false },
      date
    }
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

  it('falls back to first post when tagged post is old but first is fresh', () => {
    ;(isPostPublishedWithinLastDay as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
    const posts = makePosts(false)
    const res = processHomePosts(posts)
    expect(res.cover?.id).toBe('2')
  })

  it('returns undefined when both tagged and fallback posts are old', () => {
    ;(isPostPublishedWithinLastDay as jest.Mock).mockReturnValue(false)
    const posts = makePosts()
    const res = processHomePosts(posts)
    // Should be undefined because we are not using the step 3 fallback anymore (I will remove it)
    expect(res.cover).toBeUndefined()
  })
})
