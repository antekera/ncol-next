import { render, screen } from '@testing-library/react'
import { RelatedPostsSlider } from '..'

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({
    ref: jest.fn(),
    inView: true
  })
}))

jest.mock('@lib/hooks/data/useRelatedPosts', () => ({
  useRelatedPosts: jest.fn()
}))
jest.mock('@components/CategoryArticle', () => ({
  CategoryArticle: ({ title }: any) => <article>{title}</article>
}))

import { useRelatedPosts } from '@lib/hooks/data/useRelatedPosts'

describe('RelatedPostsSlider', () => {
  test('returns null when less than 3 posts', () => {
    ;(useRelatedPosts as jest.Mock).mockReturnValue({
      data: [{ node: { slug: 'a' } }]
    })
    const { container } = render(<RelatedPostsSlider slug='s' />)
    expect(container.firstChild).toBeNull()
  })

  test('renders slider with related posts', () => {
    ;(useRelatedPosts as jest.Mock).mockReturnValue({
      data: [
        { node: { slug: 'a', title: 'A', date: new Date().toISOString() } },
        { node: { slug: 'b', title: 'B', date: new Date().toISOString() } },
        { node: { slug: 'c', title: 'C', date: new Date().toISOString() } }
      ]
    })
    render(<RelatedPostsSlider slug='s' />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  test('passes categoryName to useRelatedPosts if categories provided', () => {
    ;(useRelatedPosts as jest.Mock).mockReturnValue({
      data: [
        { node: { slug: 'a', date: new Date().toISOString() } },
        { node: { slug: 'b', date: new Date().toISOString() } },
        { node: { slug: 'c', date: new Date().toISOString() } }
      ]
    })
    const categories = {
      edges: [{ node: { name: 'nacionales', slug: 'nacionales' } }],
      type: 'category'
    }
    render(<RelatedPostsSlider slug='s' categories={categories as any} />)
    expect(useRelatedPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryName: 'nacionales'
      })
    )
  })
})
