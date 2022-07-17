import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { PostCategories } from '..'

let documentBody: RenderResult

describe('PostCategories', () => {
  beforeEach(() => {
    documentBody = render(<PostCategories />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
