/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react'

import { usePageStore } from '@lib/hooks/store'

import { Layout } from '..'

const mockPerformanceMark = jest.fn()
window.performance.mark = mockPerformanceMark

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null)
    }
  }
}))

describe('Layout', () => {
  beforeEach(() => {
    usePageStore.setState({
      today: new Date('2000-01-01T00:00:00.000Z')
    })
  })

  test('should match snapshots', () => {
    const { container } = render(<Layout>Content</Layout>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
