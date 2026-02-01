/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'
import { LazyImage } from '..'

// Create a mock function for useInView
const useInViewMock = jest.fn()

jest.mock('react-intersection-observer', () => ({
  useInView: () => useInViewMock()
}))

jest.mock('@components/CoverImage', () => ({
  CoverImage: ({ title }: { title: string }) => (
    <img alt={title} data-testid='cover-image' />
  )
}))

describe('LazyImage', () => {
  const props = { title: 'My image', coverImage: '/img.png' }

  beforeEach(() => {
    useInViewMock.mockReset()
  })

  test('renders skeleton while not in view', () => {
    useInViewMock.mockReturnValue({ ref: jest.fn(), inView: false })
    const { container } = render(<LazyImage {...props} />)
    // The skeleton has 'animate-pulse' class from shadcn/ui skeleton
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByTestId('cover-image')).not.toBeInTheDocument()
  })

  test('renders image when in view', () => {
    useInViewMock.mockReturnValue({ ref: jest.fn(), inView: true })
    const { container } = render(<LazyImage {...props} />)
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
    expect(screen.getByTestId('cover-image')).toBeInTheDocument()
  })
})
