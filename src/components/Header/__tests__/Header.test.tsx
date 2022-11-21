import React from 'react'

import { render } from '@testing-library/react'

import { Header } from '..'

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

describe('Header', () => {
  test('should match snapshots', () => {
    const { container } = render(<Header headerType='main' />)
    expect(container).toBeDefined()
  })
})
