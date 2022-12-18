import React from 'react'

import { render } from '@testing-library/react'

import { Sidebar } from '..'

describe('Sidebar', () => {
  test('should match snapshots', () => {
    const { container } = render(<Sidebar />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
