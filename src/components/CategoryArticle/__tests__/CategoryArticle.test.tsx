import { render, screen } from '@testing-library/react'
import { CategoryArticle } from '..'

jest.mock('@components/PostCategories', () => ({
  PostCategories: () => <div data-testid='cats' />
}))
jest.mock('@components/LazyImage', () => ({
  LazyImage: ({ title }: any) => <img alt={title} />
}))
jest.mock('@components/DateTime', () => ({ DateTime: () => <time>date</time> }))
jest.mock('@lib/utils/ga', () => ({ GAEvent: jest.fn() }))

describe('CategoryArticle', () => {
  const base = {
    id: 'a',
    title: 'This is a long title for article',
    uri: '/post',
    featuredImage: { node: { sourceUrl: '/img.jpg' } },
    date: '2025-01-01',
    categories: { edges: [{ node: { name: 'Category' } }] }
  } as any

  test('returns null when title is too short', () => {
    const { container } = render(<CategoryArticle {...base} title='short' />)
    expect(container.firstChild).toBeNull()
  })

  test('renders list type with categories, date and image', () => {
    render(<CategoryArticle {...base} type='list' />)
    expect(
      screen.getByRole('img', { name: /this is a long/i })
    ).toBeInTheDocument()
    expect(screen.getByText('date')).toBeInTheDocument()
    expect(screen.getByTestId('cats')).toBeInTheDocument()
  })

  test('renders secondary type with separator and category tag over image', () => {
    const { container } = render(<CategoryArticle {...base} type='secondary' />)
    expect(container.querySelector('hr')).toBeInTheDocument()
    expect(screen.getByTestId('cats')).toBeInTheDocument()
  })

  test('uses a prepared Home identity without changing the destination or legacy default', () => {
    const { container, rerender } = render(
      <CategoryArticle
        {...base}
        homePosition={1}
        homeArticleId='uri_public_key'
      />
    )
    expect(container.querySelector('article')).toHaveAttribute(
      'data-article-id',
      'uri_public_key'
    )
    expect(screen.getByRole('link', { name: base.title })).toHaveAttribute(
      'href',
      '/post'
    )
    rerender(<CategoryArticle {...base} homePosition={1} />)
    expect(container.querySelector('article')).toHaveAttribute(
      'data-article-id',
      'a'
    )
    rerender(
      <CategoryArticle {...base} homePosition={1} homeArticleId={null} />
    )
    expect(container.querySelector('article')).not.toHaveAttribute(
      'data-article-id'
    )
    expect(screen.getByRole('link', { name: base.title })).toBeVisible()
  })
})
