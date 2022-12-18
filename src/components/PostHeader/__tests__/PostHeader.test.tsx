import React from 'react'

import { render } from '@testing-library/react'

import { PostHeader } from '..'
import { pageProps } from '../../../__mocks__/page-props.json'

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

describe('PostHeader', () => {
  test('should match snapshots', () => {
    const { container } = render(<PostHeader {...pageProps.post} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
