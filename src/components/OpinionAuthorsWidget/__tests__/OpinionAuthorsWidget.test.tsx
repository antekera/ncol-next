import { render, screen } from '@testing-library/react'
import { OpinionAuthorsWidget } from '..'
import { useOpinionAuthors } from '@lib/hooks/data/useOpinionAuthors'

jest.mock('@lib/hooks/data/useOpinionAuthors', () => ({
  useOpinionAuthors: jest.fn()
}))
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true })
}))
jest.mock('@components/HoverPrefetchLink', () => ({
  HoverPrefetchLink: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  )
}))

beforeEach(() => {
  jest.mocked(useOpinionAuthors).mockReturnValue({
    authors: [
      {
        name: 'Columnista editorial',
        slug: 'columna',
        uri: '/autor/columna/',
        avatarUrl: '',
        latestPost: { uri: '/2026/10/17/columna/', title: 'Opinión editorial' }
      }
    ],
    isLoading: false,
    error: undefined
  })
})

it('marks only the latest article and preserves author links outside its placement', () => {
  const props = { homePosition: 4 }
  render(<OpinionAuthorsWidget {...props} />)
  const editorialModule = screen.getByRole('region', { name: 'Columnistas' })
  expect(editorialModule).toHaveAttribute('data-module-id', 'opinion')
  expect(editorialModule).toHaveAttribute('data-editorial-position', '4')
  expect(screen.getByText('Opinión editorial')).toHaveAttribute(
    'data-article-id',
    '/2026/10/17/columna/'
  )
  for (const link of screen.getAllByRole('link', {
    name: 'Columnista editorial'
  }))
    expect(link.closest('[data-article-id]')).toBeNull()
  expect(screen.getByText('Ver más')).toHaveAttribute(
    'data-component-type',
    'section_link'
  )
})

it('keeps default shared uses free of Home markers and leaves skeletons without articles', () => {
  const { container, rerender } = render(<OpinionAuthorsWidget />)
  expect(container.querySelector('[data-module-id]')).toBeNull()
  expect(container.querySelector('[data-article-id]')).toBeNull()
  jest
    .mocked(useOpinionAuthors)
    .mockReturnValue({ authors: [], isLoading: true, error: undefined })
  rerender(<OpinionAuthorsWidget {...{ homePosition: 8 }} />)
  expect(container.querySelector('[data-article-id]')).toBeNull()
})
