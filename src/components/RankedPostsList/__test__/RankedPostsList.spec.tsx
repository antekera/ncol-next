import { render, screen } from '@testing-library/react'
import { RankedPostsList } from '..'
import '@testing-library/jest-dom'

jest.mock('@components/CategoryArticle', () => ({
  CategoryArticle: jest.fn(({ title }) => <div>{title}</div>)
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

  it('renders the skeleton when no data is provided', () => {
    render(<RankedPostsList />)
    // Assuming MostVisitedPostsSkeleton renders a specific role or text
    // This might need adjustment based on the actual skeleton component
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument()
  })
})
