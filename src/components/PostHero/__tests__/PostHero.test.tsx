import React from 'react'

import { render } from '@testing-library/react'

import { PostHero } from '..'

describe('PostHero', () => {
  test('should be defined', () => {
    const { container } = render(<PostHero />)
    expect(container.firstChild).toBeDefined()
  })
})
