import { render, screen } from '@testing-library/react'
import MostRecentPostBanner from '@blocks/content/MostRecentPostBanner'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'

jest.mock('@lib/hooks/data/useMostVisitedPosts')

const useMostVisitedPostsMock = useMostVisitedPosts as jest.Mock

describe('MostRecentPostBanner', () => {
  it('should render the loading skeleton when loading', () => {
    useMostVisitedPostsMock.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    })
    render(<MostRecentPostBanner />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('should not render on error', () => {
    useMostVisitedPostsMock.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('test error')
    })
    const { container } = render(<MostRecentPostBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('should not render when there are no posts', () => {
    useMostVisitedPostsMock.mockReturnValue({
      data: { results: [] },
      isLoading: false,
      error: null
    })
    const { container } = render(<MostRecentPostBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('should render the post title when there is data', () => {
    useMostVisitedPostsMock.mockReturnValue({
      data: {
        results: [
          {
            title: 'Test Post',
            slug: 'test-post'
          }
        ]
      },
      isLoading: false,
      error: null
    })
    render(<MostRecentPostBanner />)
    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })

  it('should have a link to the post', () => {
    useMostVisitedPostsMock.mockReturnValue({
      data: {
        results: [
          {
            title: 'Test Post',
            slug: 'test-post'
          }
        ]
      },
      isLoading: false,
      error: null
    })
    render(<MostRecentPostBanner />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/post/test-post')
  })
})
