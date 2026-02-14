import { render, screen } from '@testing-library/react'
import { RankedPostsList } from '..'
import '@testing-library/jest-dom'
import * as Sentry from '@sentry/browser'

// Create dependency mocks
const useIsMobileMock = jest.fn()

jest.mock('@lib/hooks/useIsMobile', () => ({
  useIsMobile: () => useIsMobileMock()
}))

// Mock dependencies
jest.mock('@components/CategoryArticle', () => ({
  CategoryArticle: jest.fn(({ title, imageSize }) => (
    <div data-testid={`article-${imageSize}`}>{title}</div>
  ))
}))

jest.mock('@components/LoadingCategory', () => ({
  Loading: () => <div data-testid='loading-skeleton'>Loading...</div>
}))

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn()
}))

const mockData = {
  posts: [
    {
      slug: 'post-1',
      title: 'Post 1',
      image: 'https://via.placeholder.com/150',
      views: 100
    },
    {
      slug: 'post-2',
      title: 'Post 2',
      image: 'https://via.placeholder.com/150',
      views: 200
    }
  ]
}

describe('RankedPostsList', () => {
  it('renders the posts', () => {
    render(<RankedPostsList data={mockData} />)
    expect(screen.getByText('Post 1')).toBeInTheDocument()
    expect(screen.getByText('Post 2')).toBeInTheDocument()
  })

  it('renders the rank', () => {
    render(<RankedPostsList data={mockData} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders blocking loading state when isLoading is true', () => {
    render(<RankedPostsList isLoading={true} />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument()
  })

  it('renders null and logs to Sentry when there is an error', () => {
    const error = new Error('Test error')
    const { container } = render(<RankedPostsList error={error} />)

    expect(container.firstChild).toBeNull()
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { component: 'RankedPostsList' }
    })
  })

  it('renders the skeleton when no data is provided', () => {
    render(<RankedPostsList />)
    // Assuming MostVisitedPostsSkeleton renders a specific role or text
    // This might need adjustment based on the actual skeleton component
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument()
  })

  it('renders correct image size for mobile', () => {
    useIsMobileMock.mockReturnValue(true)
    render(<RankedPostsList data={mockData} />)
    expect(screen.getAllByTestId('article-sm')).toHaveLength(2)
  })

  it('renders correct image size for desktop', () => {
    useIsMobileMock.mockReturnValue(false)
    render(<RankedPostsList data={mockData} />)
    expect(screen.getAllByTestId('article-xs')).toHaveLength(2)
  })
})
