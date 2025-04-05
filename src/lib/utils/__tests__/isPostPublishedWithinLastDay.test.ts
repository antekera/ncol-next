import { isPostPublishedWithinLastDay } from '../isPostPublishedWithinLastDay'
import { isWithinInterval, subDays } from 'date-fns'

import { edges } from '@mocks/homePosts.json'

jest.mock('date-fns', () => ({
  isWithinInterval: jest.fn(),
  subDays: jest.fn()
}))

describe('isPostPublishedWithinLastDay', () => {
  const mockNow = new Date('2024-01-15T12:00:00Z')
  const mockYesterday = new Date('2024-01-14T12:00:00Z')

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(global, 'Date').mockImplementation(() => mockNow)
    ;(subDays as jest.Mock).mockReturnValue(mockYesterday)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return false if cover is undefined', () => {
    expect(isPostPublishedWithinLastDay(undefined)).toBe(false)
  })

  it('should return true for a post published within last 24 hours', () => {
    const postDate = new Date('2024-01-15T10:00:00Z')
    ;(isWithinInterval as jest.Mock).mockReturnValue(true)

    const result = isPostPublishedWithinLastDay({
      ...edges[0]?.node,
      date: postDate.toISOString(),
      // fix type
      slug: '',
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: ''
      }
    })

    expect(result).toBe(true)
    expect(isWithinInterval).toHaveBeenCalledWith(postDate, {
      start: mockYesterday,
      end: mockNow
    })
  })

  it('should return false for a post published more than 24 hours ago', () => {
    const postDate = new Date('2024-01-13T10:00:00Z')
    ;(isWithinInterval as jest.Mock).mockReturnValue(false)

    const result = isPostPublishedWithinLastDay({
      ...edges[0]?.node,
      date: postDate.toISOString(),
      // fix type
      slug: '',
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: ''
      }
    })

    expect(result).toBe(false)
    expect(isWithinInterval).toHaveBeenCalledWith(postDate, {
      start: mockYesterday,
      end: mockNow
    })
  })

  it('should handle string dates', () => {
    const dateString = '2024-01-15T10:00:00Z'
    ;(isWithinInterval as jest.Mock).mockReturnValue(true)

    const result = isPostPublishedWithinLastDay({
      ...edges[0]?.node,
      date: dateString,
      // fix type
      slug: '',
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: ''
      }
    })

    expect(result).toBe(true)
    expect(isWithinInterval).toHaveBeenCalledWith(new Date(dateString), {
      start: mockYesterday,
      end: mockNow
    })
  })
})
