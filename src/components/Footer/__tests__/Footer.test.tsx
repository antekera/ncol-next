import React from 'react'

import { render } from '@testing-library/react'

import { Footer } from '..'

describe('Footer', () => {
  test('should be defined', () => {
    const { container } = render(<Footer />)
    expect(container).toBeDefined()
  })
})
