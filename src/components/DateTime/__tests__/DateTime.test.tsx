import React from 'react'

import { render } from '@testing-library/react'

import { DateTime } from '..'

describe('DateTime', () => {
  test('should be defined', () => {
    const { container } = render(<DateTime />)
    expect(container.firstChild).toBeDefined()
  })
})
