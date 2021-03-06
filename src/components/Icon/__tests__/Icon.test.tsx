import React from 'react'

import { render } from '@testing-library/react'

import { Icon } from '..'

const props = {
  network: 'facebook',
  width: '20',
  size: false
}

describe('Icon', () => {
  test('should be defined', () => {
    const { container } = render(<Icon {...props} />)
    expect(container.firstChild).toBeDefined()
  })
})
