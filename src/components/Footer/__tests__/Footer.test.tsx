import { render } from '@testing-library/react'
import { Footer } from '..'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams() {
    return {
      slug: '/'
    }
  },
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams())
}))

describe('Footer', () => {
  test('should match snapshots', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})
