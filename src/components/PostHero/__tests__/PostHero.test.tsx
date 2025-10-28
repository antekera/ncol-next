/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostHero } from '..'

jest.mock('@components/CoverImage', () => ({
  CoverImage: ({ title }: { title: string }) => <img alt={title} />
}))
jest.mock('@components/Excerpt', () => ({
  Excerpt: ({ text }: any) => <p>{text}</p>
}))
jest.mock('@components/DateTime', () => ({
  DateTime: ({ dateString }: any) => <time>{dateString}</time>
}))
jest.mock('@components/MostVisitedPosts', () => ({
  MostVisitedPosts: () => <div data-testid='most-visited' />
}))
jest.mock('@lib/hooks/useIsMobile', () => ({ useIsMobile: () => true }))
jest.mock('@lib/utils/ga', () => ({ GAEvent: jest.fn() }))
import { GAEvent } from '@lib/utils/ga'
jest.mock('@lib/utils/processHomePosts', () => ({
  processHomePosts: () => ({
    cover: {
      featuredImage: { node: { sourceUrl: '/a.jpg' } },
      uri: '/post/mi-post',
      title: 'Mi Post',
      excerpt: 'Resumen',
      date: '2025-01-10',
      categories: { edges: [], type: '' }
    }
  })
}))
jest.mock('@lib/hooks/data/useHeroPosts', () => ({
  useHeroPosts: () => ({ isLoading: false, data: {} })
}))
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

describe('PostHero', () => {
  const user = userEvent.setup()
  const props = { qty: 1, slug: 'home' }

  test('renders image, title link, excerpt and date', () => {
    render(<PostHero {...props} />)
    expect(screen.getByRole('img', { name: 'Mi Post' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi Post' })).toHaveAttribute(
      'href',
      '/post/mi-post'
    )
    expect(screen.getByText('Resumen')).toBeInTheDocument()
    expect(screen.getByText('2025-01-10')).toBeInTheDocument()
    expect(screen.getByTestId('most-visited')).toBeInTheDocument()
  })

  test('fires GAEvent on title click', async () => {
    jest.useRealTimers()
    render(<PostHero {...props} />)
    await user.click(screen.getByRole('link', { name: 'Mi Post' }))
    expect(GAEvent).toHaveBeenCalled()
  })
})
