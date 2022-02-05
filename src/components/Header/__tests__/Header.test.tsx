import React from 'react'

import { render } from '@testing-library/react'

import { Header } from '..'

describe('Header', () => {
  test('should be defined', () => {
    const { container } = render(<Header />)
    expect(container).toBeDefined()
  })
})
