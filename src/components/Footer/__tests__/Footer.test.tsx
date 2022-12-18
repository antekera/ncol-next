import React from 'react'

import { render } from '@testing-library/react'

import { Footer } from '..'

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

describe('Footer', () => {
  test('should match snapshots', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})
