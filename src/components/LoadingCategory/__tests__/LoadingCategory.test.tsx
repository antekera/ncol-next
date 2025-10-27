import { render } from '@testing-library/react'
import { Loading } from '..'

describe('LoadingCategory', () => {
  test('renders list skeletons', () => {
    const { container } = render(<Loading />)
    // Renders multiple skeleton placeholders
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })
})
