import { render, screen } from '@testing-library/react'
import { MostVisitedPosts } from '..'

jest.mock('@lib/hooks/data/useMostVisitedPosts', () => ({
  useMostVisitedPosts: jest.fn()
}))
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true })
}))
jest.mock('@components/CategoryArticle', () => ({
  CategoryArticle: ({
    title,
    homePosition
  }: {
    title: string
    homePosition?: number
  }) => <article data-item-position={homePosition}>{title}</article>
}))
jest.mock('@lib/hooks/useIsMobile', () => ({ useIsMobile: () => false }))

import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'

describe('MostVisitedPosts', () => {
  test('renders skeleton when no data', () => {
    ;(useMostVisitedPosts as jest.Mock).mockReturnValue({
      data: null,
      error: null
    })
    const { container } = render(<MostVisitedPosts />)
    // skeleton indicator class
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })

  test('renders posts when data available', () => {
    ;(useMostVisitedPosts as jest.Mock).mockReturnValue({
      data: {
        posts: [
          { slug: '/a', image: '/a.jpg', title: 'A' },
          { slug: '/b', image: '/b.jpg', title: 'B' }
        ]
      },
      error: null
    })
    render(<MostVisitedPosts />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
  test('marks the weekly mobile Home ranking without changing the shared default', () => {
    ;(useMostVisitedPosts as jest.Mock).mockReturnValue({
      data: { posts: [{ slug: '/a', image: '/a.jpg', title: 'A' }] },
      error: null
    })
    const { container, rerender } = render(<MostVisitedPosts />)
    expect(container.firstChild?.nodeName).toBe('DIV')
    expect(container.querySelector('[data-module-id]')).toBeNull()
    rerender(<MostVisitedPosts homeMeasurement />)
    expect(container.querySelector('section')).toHaveAttribute(
      'data-module-id',
      'ranking-week'
    )
    expect(container.querySelector('[data-item-position="1"]')).not.toBeNull()
  })
})
