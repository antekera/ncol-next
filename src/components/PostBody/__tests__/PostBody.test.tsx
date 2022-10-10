import React from 'react'

import { render } from '@testing-library/react'

import { PostBody } from '..'

describe('PostBody', () => {
  test('should be defined', () => {
    const { container } = render(
      <PostBody
        firstParagraph='<p>Lorem ipsum</p>'
        secondParagraph='<p>Lorem ipsum</p>'
        adId='adId'
      />
    )
    expect(container.firstChild).toBeDefined()
  })
})
