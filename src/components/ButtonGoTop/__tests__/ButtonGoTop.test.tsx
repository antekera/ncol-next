import React from 'react'

import { render } from '@testing-library/react'

import { ButtonGoTop } from '..'

describe('ButtonGoTop', () => {
  test('should be defined', () => {
    const { container } = render(<ButtonGoTop />)
    expect(container.firstChild).toBeDefined()
  })
})
