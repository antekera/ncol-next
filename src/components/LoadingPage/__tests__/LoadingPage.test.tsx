import React from 'react'

import { render } from '@testing-library/react'

import { usePageStore } from '@lib/hooks/store'

import { LoadingPage } from '..'

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

describe('LoadingPage', () => {
  beforeEach(() => {
    usePageStore.setState({
      today: new Date('2000-01-01T00:00:00.000Z')
    })
  })

  test('should match snapshots', () => {
    const { container } = render(<LoadingPage />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
