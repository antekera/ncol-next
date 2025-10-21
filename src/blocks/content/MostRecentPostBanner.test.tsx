import { render, screen } from '@testing-library/react'
import MostRecentPostBanner from '@blocks/content/MostRecentPostBanner'
import { useMostRecentPost } from '@lib/hooks/data/useMostRecentPost'

jest.mock('@lib/hooks/data/useMostRecentPost')

const useMostRecentPostMock = useMostRecentPost as jest.Mock

describe('MostRecentPostBanner', () => {
  it('should render the loading skeleton when loading', () => {
    useMostRecentPostMock.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    })
    render(<MostRecentPostBanner />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('should not render on error', () => {
    useMostRecentPostMock.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('test error')
    })
    const { container } = render(<MostRecentPostBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('should not render when there are no posts', () => {
    useMostRecentPostMock.mockReturnValue({
      data: { results: [] },
      isLoading: false,
      error: null
    })
    const { container } = render(<MostRecentPostBanner />)
    expect(container.firstChild).toBeNull()
  })

    it('should not render when results are null', () => {
    useMostRecentPostMock.mockReturnValue({
      data: { results: null },
      isLoading: false,
      error: null
    })
    const { container } = render(<MostRecentPostBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('should render the post title when there is data', () => {
    useMostRecentPostMock.mockReturnValue({
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
    useMostRecentPostMock.mockReturnValue({
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
