import React from 'react'

import { render } from '@testing-library/react'

import { CategoryArticle } from '..'

const props = {
  id: '1234',
  title: 'Post title',
  uri: '/post-title',
  slug: '/2022/10/10/post-title',
  featuredImage: {
    node: {
      sourceUrl: '/image-url.png'
    }
  },
  excerpt: 'Lorem ipsum...',
  date: '',
  className: 'class',
  isFirst: false,
  isLast: false
}

describe('CategoryArticle', () => {
  test('should be defined', () => {
    const { container } = render(<CategoryArticle {...props} />)
    expect(container.firstChild).toBeDefined()
  })
})
