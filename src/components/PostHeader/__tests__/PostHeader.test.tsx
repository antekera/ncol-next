import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { PostHeader } from '..'

let documentBody: RenderResult

describe('PostHeader', () => {
  beforeEach(() => {
    documentBody = render(<PostHeader />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
