/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import { LegalPage } from '..'

const mockPerformanceMark = jest.fn()
window.performance.mark = mockPerformanceMark

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams() {
    return {
      slug: '/'
    }
  }
}))

const props = {
  title: 'Lorem ipsum'
}

// TODO: Skipping tests temporarily
describe.skip('LegalPage', () => {
  test('should match snapshots', () => {
    const { container } = render(<LegalPage {...props}> Content </LegalPage>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
