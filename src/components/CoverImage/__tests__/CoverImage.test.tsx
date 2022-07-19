import React from 'react'

import { render } from '@testing-library/react'

import { CoverImage } from '..'

const props = {
  coverImage: '/image.png',
  title: 'Image title',
  uri: '/image.png'
}

describe('CoverImage', () => {
  test('should be defined', () => {
    const { container } = render(<CoverImage {...props} />)
    expect(container.firstChild).toBeDefined()
  })
})
