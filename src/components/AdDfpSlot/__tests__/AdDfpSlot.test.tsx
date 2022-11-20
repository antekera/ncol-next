import React from 'react'

jest.mock('@blackbox-vision/next-google-dfp', () => {
  return {
    Ad: jest.fn()
  }
})

import { render } from '@testing-library/react'

import { AdDfpSlot } from '..'

describe('AdDfpSlot', () => {
  test('should be defined', () => {
    const { container } = render(<AdDfpSlot id='12456789-0' />)
    expect(container.firstChild).toBeDefined()
  })
})
