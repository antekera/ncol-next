import React from 'react'

import { render } from '@testing-library/react'

import { SideNav } from '..'

describe('SideNav', () => {
  test('should match snapshots', () => {
    const { container } = render(<SideNav isOpen={false} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should match snapshots isOpen', () => {
    const { container } = render(<SideNav isOpen={true} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
