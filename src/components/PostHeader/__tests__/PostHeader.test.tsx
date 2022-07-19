import React from 'react'

import { render } from '@testing-library/react'

import { PostHeader } from '..'

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
  title: 'Post title',
  date: '',
  categories: {
    edges: [
      {
        node: {
          name: 'sucesos',
          uri: 'sucesos',
          slug: '/sucesos',
          categoryId: '1234'
        }
      }
    ]
  },
  antetituloNoticia: '',
  fuenteNoticia: ''
}

describe('PostHeader', () => {
  test('should be defined', () => {
    const { container } = render(<PostHeader {...props} />)
    expect(container.firstChild).toBeDefined()
  })
})
