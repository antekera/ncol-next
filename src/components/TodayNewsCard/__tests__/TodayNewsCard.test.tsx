import { render, screen } from '@testing-library/react'
import { TodayNewsCard } from '..'

jest.mock('@components/HoverPrefetchLink', () => ({
  HoverPrefetchLink: ({ children, href }: any) => <a href={href}>{children}</a>
}))
jest.mock('@components/DateTime', () => ({
  DateTime: () => <time>date</time>
}))
jest.mock('@lib/utils/ga', () => ({ GAEvent: jest.fn() }))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>
}))

const base = {
  id: 'card-1',
  title: 'A long enough card title to render',
  uri: '/post/card-1',
  date: '2026-04-23T10:00:00',
  categories: {
    edges: [{ node: { name: 'Deportes', slug: 'deportes', parentId: null } }]
  },
  featuredImage: {
    node: {
      sourceUrl: '/card.jpg',
      srcSet: '/card.jpg 400w',
      mediaDetails: { width: 400, height: 225 }
    }
  }
}

describe('TodayNewsCard', () => {
  test('returns null when title is too short', () => {
    const { container } = render(<TodayNewsCard {...base} title='short' />)
    expect(container.firstChild).toBeNull()
  })

  test('renders image, category link, title and date', () => {
    render(<TodayNewsCard {...base} />)
    expect(screen.getByAltText(/a long enough card/i)).toBeInTheDocument()
    expect(screen.getByText(/deportes/i)).toBeInTheDocument()
    expect(screen.getByText(/a long enough card/i)).toBeInTheDocument()
    expect(screen.getByText('date')).toBeInTheDocument()
  })

  test('category label links to category page', () => {
    render(<TodayNewsCard {...base} />)
    const link = screen.getByRole('link', { name: /deportes/i })
    expect(link).toHaveAttribute('href', '/categoria/deportes')
  })

  test('renders without featuredImage', () => {
    const { container } = render(
      <TodayNewsCard {...base} featuredImage={undefined} />
    )
    expect(container.querySelector('article')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  test('image uses lazy loading', () => {
    render(<TodayNewsCard {...base} />)
    expect(screen.getByAltText(/a long enough card/i)).toHaveAttribute(
      'loading',
      'lazy'
    )
  })
})
