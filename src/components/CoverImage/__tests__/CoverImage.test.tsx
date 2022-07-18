import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { CoverImage } from '..'

let documentBody: RenderResult

describe('CoverImage', () => {
  beforeEach(() => {
    documentBody = render(<CoverImage />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
