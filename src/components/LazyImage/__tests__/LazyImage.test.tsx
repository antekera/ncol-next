/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'
import { LazyImage } from '..'

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: false })
}))

jest.mock('@components/CoverImage', () => ({
  CoverImage: ({ title }: { title: string }) => (
    <img alt={title} data-testid='cover-image' />
  )
}))

describe('LazyImage', () => {
  const props = { title: 'My image', coverImage: '/img.png' }

  test('renders skeleton while not in view', () => {
    const { container } = render(<LazyImage {...props} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByTestId('cover-image')).not.toBeInTheDocument()
  })
})
