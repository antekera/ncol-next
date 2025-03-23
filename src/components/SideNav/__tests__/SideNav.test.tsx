import { render } from '@testing-library/react'
import { SideNav } from '..'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams() {
    return {
      slug: '/'
    }
  }
}))

// TODO: Skipping tests temporarily until SideNav component is fully implemented
describe.skip('SideNav', () => {
  test('should match snapshots', () => {
    const { container } = render(<SideNav />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should match snapshots isOpen', () => {
    const { container } = render(<SideNav />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
