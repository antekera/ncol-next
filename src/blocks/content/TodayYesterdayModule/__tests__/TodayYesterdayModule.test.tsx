import { render, screen } from '@testing-library/react'
import { getSecondaryPosts, TodayHeroSection, TodaySecondaryGrid } from '..'
import { TodayPostsResult } from '@app/actions/getTodayYesterdayPosts'

jest.mock('@components/TodayHeroPost', () => ({
  TodayHeroPost: ({ title }: any) => <div data-testid='hero'>{title}</div>
}))
jest.mock('@components/TodayNewsCard', () => ({
  TodayNewsCard: ({ title }: any) => <div data-testid='card'>{title}</div>
}))

const makePost = (id: string) => ({
  node: {
    id,
    title: `Post ${id}`,
    uri: `/post-${id}`,
    date: '2026-04-23T10:00:00',
    categories: { edges: [] }
  }
})

const makePosts = (count: number): TodayPostsResult => ({
  edges: Array.from({ length: count }, (_, i) => makePost(String(i + 1)))
})

describe('getSecondaryPosts', () => {
  test('returns empty array when fewer than 3 posts', () => {
    expect(getSecondaryPosts(makePosts(2).edges)).toEqual([])
  })

  test('returns 3 posts when 4 total (rounds down to multiple of 3)', () => {
    expect(getSecondaryPosts(makePosts(4).edges)).toHaveLength(3)
  })

  test('returns 3 posts when exactly 4 total', () => {
    expect(getSecondaryPosts(makePosts(4).edges)).toHaveLength(3)
  })

  test('returns 6 posts when 7 total (hero + 6 secondary)', () => {
    expect(getSecondaryPosts(makePosts(7).edges)).toHaveLength(6)
  })

  test('caps at 6 secondary posts even with more input', () => {
    expect(getSecondaryPosts(makePosts(20).edges)).toHaveLength(6)
  })

  test('returns 0 when exactly 3 total (hero=1, remaining=2, floor(2/3)*3=0)', () => {
    expect(getSecondaryPosts(makePosts(3).edges)).toHaveLength(0)
  })

  test('returns 3 when 4 posts', () => {
    // 4 total: hero=1, remaining=3, capped=3, rounded=3
    expect(getSecondaryPosts(makePosts(4).edges)).toHaveLength(3)
  })
})

describe('TodayHeroSection', () => {
  test('renders nothing when no posts', () => {
    const { container } = render(<TodayHeroSection posts={{ edges: [] }} />)
    expect(container.firstChild).toBeNull()
  })

  test('renders hero post', () => {
    render(<TodayHeroSection posts={makePosts(1)} />)
    expect(screen.getByTestId('hero')).toBeInTheDocument()
  })
})

describe('TodaySecondaryGrid', () => {
  test('renders nothing when fewer than 3 posts', () => {
    const { container } = render(<TodaySecondaryGrid posts={makePosts(2)} />)
    expect(container.firstChild).toBeNull()
  })

  test('renders cards for secondary posts', () => {
    render(<TodaySecondaryGrid posts={makePosts(7)} />)
    expect(screen.getAllByTestId('card')).toHaveLength(6)
  })
})
