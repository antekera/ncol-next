import { render, screen } from '@testing-library/react'
import { PostHeader } from '..'

jest.mock('@components/PostCategories', () => ({
  PostCategories: () => <div data-testid='cats' />
}))
jest.mock('@components/Share', () => ({
  Share: () => <div data-testid='share' />
}))
jest.mock('@components/VisitCounter', () => ({
  VisitCounter: () => <div data-testid='counter' />
}))
jest.mock('@components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid='skeleton' />
}))
jest.mock('@components/DateTime', () => ({ DateTime: () => <time>date</time> }))

describe('PostHeader', () => {
  test('shows skeletons when loading', () => {
    const { getAllByTestId } = render(
      <PostHeader
        isLoading
        title='Title'
        categories={{ edges: [], type: '' }}
      />
    )
    expect(getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  test('renders title, date and share, and visit counter when conditions met', () => {
    render(
      <PostHeader
        title='Title'
        date='2025-01-01'
        uri='/post'
        featuredImage={{ node: { srcSet: '/imgset' } } as any}
        fuenteNoticia='Some'
        categories={{ edges: [], type: '' }}
      />
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('date')).toBeInTheDocument()
    expect(screen.getByTestId('share')).toBeInTheDocument()
    expect(screen.getByTestId('counter')).toBeInTheDocument()
  })
})
