import React from 'react'

import { render } from '@testing-library/react'

import { Excerpt } from '..'

describe('Excerpt', () => {
  test('should be defined', () => {
    const { container } = render(<Excerpt />)
    expect(container.firstChild).toBeDefined()
  })
})
