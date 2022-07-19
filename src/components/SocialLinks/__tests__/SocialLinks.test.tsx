import React from 'react'

import { render } from '@testing-library/react'

import { SocialLinks } from '..'

describe('SocialLinks', () => {
  beforeEach(() => {})

  test('should be defined', () => {
    const { container } = render(<SocialLinks />)
    expect(container.firstChild).toBeDefined()
  })
})
