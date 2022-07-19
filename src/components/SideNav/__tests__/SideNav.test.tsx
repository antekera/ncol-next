import React from 'react'

import { render } from '@testing-library/react'

import { SideNav } from '..'

describe('SideNav', () => {
  test('should be defined', () => {
    const { container } = render(<SideNav isOpen={false} />)
    expect(container.firstChild).toBeDefined()
  })
})
