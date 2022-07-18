import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { SocialLinks } from '..'

let documentBody: RenderResult

describe('SocialLinks', () => {
  beforeEach(() => {
    documentBody = render(<SocialLinks />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
