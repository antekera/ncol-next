import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { CategoryArticle } from '..'

let documentBody: RenderResult

describe('CategoryArticle', () => {
  beforeEach(() => {
    documentBody = render(<CategoryArticle />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
