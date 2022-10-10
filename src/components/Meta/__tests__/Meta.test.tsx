import React from 'react'

import { render } from '@testing-library/react'

import { Meta } from '..'

describe('Meta', () => {
  test('should be defined', () => {
    const { container } = render(<Meta />)
    expect(container.firstChild).toBeDefined()
  })
})
