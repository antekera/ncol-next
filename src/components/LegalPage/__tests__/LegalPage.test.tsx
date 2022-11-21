import React from 'react'

import { render } from '@testing-library/react'

import { LegalPage } from '..'

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

const props = {
  title: 'Lorem ipsum'
}

describe('LegalPage', () => {
  test('should match snapshots', () => {
    const { container } = render(<LegalPage {...props}> Content </LegalPage>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
