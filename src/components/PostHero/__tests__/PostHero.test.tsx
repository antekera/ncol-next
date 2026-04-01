/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostHero } from '..'
import { PostHome } from '@lib/types'

jest.mock('@components/CoverImage', () => ({
  CoverImage: ({ title }: { title: string }) => <img alt={title} />
}))
jest.mock('@components/Excerpt', () => ({
  Excerpt: ({ text }: any) => <p>{text}</p>
}))
jest.mock('@components/DateTime', () => ({
  DateTime: ({ dateString }: any) => <time>{dateString}</time>
}))
jest.mock('@lib/utils/ga', () => ({ GAEvent: jest.fn() }))
import { GAEvent } from '@lib/utils/ga'
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, onClick, children }: any) => (
    <a
      href={href}
      onClick={(e: any) => {
        e.preventDefault()
        onClick?.(e)
      }}
    >
      {children}
    </a>
  )
}))

const mockPost: PostHome = {
  featuredImage: { node: { sourceUrl: '/a.jpg' } },
  uri: '/post/mi-post',
  title: 'Mi Post',
  excerpt: 'Resumen',
  date: '2025-01-10',
  categories: { edges: [], type: '' },
  id: '1',
  slug: 'mi-post',
  pageInfo: {
    endCursor: '',
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: ''
  },
  tags: { edges: [] }
}

describe('PostHero', () => {
  const user = userEvent.setup()

  test('renders image, title link, excerpt and date', () => {
    render(<PostHero post={mockPost} />)
    expect(screen.getByRole('img', { name: 'Mi Post' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi Post' })).toHaveAttribute(
      'href',
      '/post/mi-post'
    )
    expect(screen.getByText('Resumen')).toBeInTheDocument()
    expect(screen.getByText('2025-01-10')).toBeInTheDocument()
  })

  test('renders nothing when post is null', () => {
    const { container } = render(<PostHero post={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  test('fires GAEvent on title click', async () => {
    jest.useRealTimers()
    render(<PostHero post={mockPost} />)
    await user.click(screen.getByRole('link', { name: 'Mi Post' }))
    expect(GAEvent).toHaveBeenCalled()
  })
})
