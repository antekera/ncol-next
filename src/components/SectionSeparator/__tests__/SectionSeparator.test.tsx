import React from 'react'

import { render } from '@testing-library/react'

import { SectionSeparator } from '..'

describe('SectionSeparator', () => {
  test('should be defined', () => {
    const { container } = render(<SectionSeparator />)
    expect(container.firstChild).toBeDefined()
  })
})
