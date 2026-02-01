import { render, screen } from '@testing-library/react'
import { RelatedPostsSlider } from '..'

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
    const { container } = render(<RelatedPostsSlider slug='s' inView />)
    expect(container.firstChild).toBeNull()
  })

  test('renders slider with related posts', () => {
    ;(useRelatedPosts as jest.Mock).mockReturnValue({
      data: [
        { node: { slug: 'a', title: 'A' } },
        { node: { slug: 'b', title: 'B' } },
        { node: { slug: 'c', title: 'C' } }
      ]
    })
    render(<RelatedPostsSlider slug='s' inView />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  test('passes categoryName to useRelatedPosts if categories provided', () => {
    ;(useRelatedPosts as jest.Mock).mockReturnValue({
      data: [
        { node: { slug: 'a' } },
        { node: { slug: 'b' } },
        { node: { slug: 'c' } }
      ]
    })
    const categories = {
      edges: [{ node: { name: 'nacionales', slug: 'nacionales' } }],
      type: 'category'
    }
    render(
      <RelatedPostsSlider slug='s' inView categories={categories as any} />
    )
    expect(useRelatedPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryName: 'nacionales'
      })
    )
  })
})
