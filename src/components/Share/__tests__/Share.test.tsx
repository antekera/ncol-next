import React from 'react'

import { render } from '@testing-library/react'

import { Share } from '..'

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

describe('Share', () => {
  test('should be defined', () => {
    const { container } = render(<Share />)
    expect(container.firstChild).toBeDefined()
  })
})
