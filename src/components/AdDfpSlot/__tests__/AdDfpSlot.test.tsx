import React from 'react'

import { render } from '@testing-library/react'

import { AdDfpSlot } from '..'

describe('AdDfpSlot', () => {
  test('should be defined', () => {
    const { container } = render(<AdDfpSlot />)
    expect(container.firstChild).toBeDefined()
  })
})
