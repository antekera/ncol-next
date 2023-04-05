import React from 'react'

import { render } from '@testing-library/react'

import { SideNav } from '..'

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

describe('SideNav', () => {
  test('should match snapshots', () => {
    const { container } = render(<SideNav isOpen={false} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should match snapshots isOpen', () => {
    const { container } = render(<SideNav isOpen={true} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
