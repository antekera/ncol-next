import React from 'react'

import { render } from '@testing-library/react'

import { PostBody } from '..'

describe('PostBody', () => {
  test('should be defined', () => {
    const { container } = render(<PostBody content='<p>Lorem ipsum</p>' />)
    expect(container.firstChild).toBeDefined()
  })
})
