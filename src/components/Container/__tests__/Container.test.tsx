import React from 'react'

import { render } from '@testing-library/react'

import { Container } from '..'

describe('Container', () => {
  test('should be defined', () => {
    const { container } = render(<Container>Content</Container>)
    expect(container.firstChild).toBeDefined()
  })
})
