import { render, screen } from '@testing-library/react'
import { TodayHeroPost } from '..'

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
  id: 'abc',
  title: 'A long enough title for the hero post',
  uri: '/post/abc',
  date: '2026-04-23T10:00:00',
  excerpt: '<p>Excerpt text</p>',
  categories: {
    edges: [
      { node: { name: 'Nacionales', slug: 'nacionales', parentId: null } }
    ]
  },
  featuredImage: {
    node: {
      sourceUrl: '/img.jpg',
      srcSet: '/img.jpg 800w',
      mediaDetails: { width: 800, height: 450 }
    }
  }
}

describe('TodayHeroPost', () => {
  test('returns null when title is too short', () => {
    const { container } = render(<TodayHeroPost {...base} title='short' />)
    expect(container.firstChild).toBeNull()
  })

  test('renders smaller variant when image is narrow', () => {
    const { container } = render(<TodayHeroPost {...base} />)
    expect(container.querySelector('article')).toBeInTheDocument()
    expect(screen.getByAltText(/a long enough/i)).toBeInTheDocument()
    expect(screen.getByText(/nacionales/i)).toBeInTheDocument()
  })

  test('renders wide overlay variant when image width >= 1200', () => {
    const wide = {
      ...base,
      featuredImage: {
        node: {
          ...base.featuredImage.node,
          mediaDetails: { width: 1200, height: 600 }
        }
      }
    }
    render(<TodayHeroPost {...wide} />)
    expect(screen.getByAltText(/a long enough/i)).toBeInTheDocument()
    expect(screen.getByText(/nacionales/i)).toBeInTheDocument()
  })

  test('renders without featuredImage', () => {
    const { container } = render(
      <TodayHeroPost {...base} featuredImage={undefined} />
    )
    expect(container.querySelector('article')).toBeInTheDocument()
  })

  test('both images use fetchPriority high and eager loading', () => {
    const { getAllByRole } = render(<TodayHeroPost {...base} />)
    const imgs = getAllByRole('img')
    imgs.forEach(img => {
      expect(img).toHaveAttribute('fetchpriority', 'high')
      expect(img).toHaveAttribute('loading', 'eager')
    })
  })
})
