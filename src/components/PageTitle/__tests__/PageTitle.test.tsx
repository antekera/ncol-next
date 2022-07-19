import React from 'react'

import { render } from '@testing-library/react'

import { PageTitle } from '..'

describe('PageTitle', () => {
  test('should be defined', () => {
    const { container } = render(<PageTitle text='Post title' />)
    expect(container.firstChild).toBeDefined()
  })
})
