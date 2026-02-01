import { render, screen } from '@testing-library/react'
import { RelatedPosts } from '..'

jest.mock('@lib/hooks/data/useRelatedPosts', () => ({
  useRelatedPosts: jest.fn()
}))
jest.mock('@components/CategoryArticle', () => ({
  CategoryArticle: ({ title }: any) => <article>{title}</article>
}))
jest.mock('@components/AdSenseBanner', () => ({
  AdSenseBanner: () => <div data-testid='ad' />
}))

import { useRelatedPosts } from '@lib/hooks/data/useRelatedPosts'

describe('RelatedPosts', () => {
  test('shows skeletons while loading', () => {
    ;(useRelatedPosts as jest.Mock).mockReturnValue({ isLoading: true })
    const { container } = render(<RelatedPosts slug='s' inView />)
    // LeftPostsSkeleton placeholders
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })

  test('renders list of related posts and ad', () => {
    ;(useRelatedPosts as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [
        { node: { slug: 'a', title: 'A' } },
        { node: { slug: 'b', title: 'B' } },
        { node: { slug: 'c', title: 'C' } }
      ]
    })
    render(<RelatedPosts slug='s' inView />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByTestId('ad')).toBeInTheDocument()
  })

  test('passes categoryName to useRelatedPosts if categories provided', () => {
    ;(useRelatedPosts as jest.Mock).mockReturnValue({ isLoading: true })
    const categories = {
      edges: [{ node: { name: 'nacionales', slug: 'nacionales' } }],
      type: 'category'
    }
    render(<RelatedPosts slug='s' inView categories={categories as any} />)
    expect(useRelatedPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryName: 'nacionales'
      })
    )
  })
})
