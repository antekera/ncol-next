import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { PostBody } from '..'

let documentBody: RenderResult

describe('PostBody', () => {
  beforeEach(() => {
    documentBody = render(<PostBody />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
