import React from 'react'

import { render } from '@testing-library/react'

import { Layout } from '..'

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
  test('should match snapshots', () => {
    const { container } = render(<Layout>Content</Layout>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
