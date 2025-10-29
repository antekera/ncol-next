import { render } from '@testing-library/react'
import { LeftPostsSkeleton, RightPostsSkeleton, CoverPostSkeleton } from '..'

describe('LoadingHome skeletons', () => {
  test('renders left posts skeleton', () => {
    const { container } = render(<LeftPostsSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })

  test('renders right posts skeleton', () => {
    const { container } = render(<RightPostsSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })

  test('renders cover post skeleton', () => {
    const { container } = render(<CoverPostSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })
})
