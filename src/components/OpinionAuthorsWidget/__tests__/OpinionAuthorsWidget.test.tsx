import { render, screen } from '@testing-library/react'
import { OpinionAuthorsWidget } from '..'
import { OpinionWidget } from '@components/HomeV2/SidebarFeeds'
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

afterEach(() => jest.useRealTimers())
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-17T15:00:00Z'))
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

it.each(['control', 'v2'])(
  '%s prefers the public post ID for measurement and keeps the URI for navigation',
  variant => {
    jest.mocked(useOpinionAuthors).mockReturnValue({
      authors: [
        {
          name: 'Columnista editorial',
          slug: 'columna',
          uri: '/autor/columna/',
          avatarUrl: '',
          latestPost: {
            id: 'cG9zdDo0MDAwMDE=',
            uri: '/2026/10/17/columna/',
            title: 'Opinión editorial'
          }
        }
      ],
      isLoading: false,
      error: undefined
    })
    render(
      variant === 'control' ? (
        <OpinionAuthorsWidget homePosition={4} />
      ) : (
        <OpinionWidget />
      )
    )
    expect(screen.getByText('Opinión editorial')).toHaveAttribute(
      'data-article-id',
      'cG9zdDo0MDAwMDE='
    )
    expect(screen.getByText('Opinión editorial')).toHaveAttribute(
      'href',
      '/2026/10/17/columna/'
    )
    for (const link of screen.getAllByRole('link', {
      name: 'Columnista editorial'
    }))
      expect(link.closest('[data-article-id]')).toBeNull()
  }
)

it('keeps older ordinary opinions and filters only expired titles in V2', () => {
  jest.setSystemTime(new Date('2026-10-18T15:00:00Z'))
  const ordinary = jest.mocked(useOpinionAuthors)().authors[0]
  jest.mocked(useOpinionAuthors).mockReturnValue({
    authors: [
      ordinary,
      {
        ...ordinary,
        slug: 'expired',
        latestPost: {
          title: 'Jornada del 17 de octubre de 2026',
          uri: '/2026/10/18/expired/'
        }
      }
    ],
    isLoading: false,
    error: undefined
  })
  const { rerender } = render(<OpinionWidget />)
  expect(screen.getByText('Opinión editorial')).toBeVisible()
  expect(screen.queryByText('Jornada del 17 de octubre de 2026')).toBeNull()
  rerender(<OpinionAuthorsWidget />)
  expect(screen.getByText('Jornada del 17 de octubre de 2026')).toBeVisible()
})
