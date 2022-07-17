import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { LoadingPage } from '..'

let documentBody: RenderResult

describe('LoadingPage', () => {
  beforeEach(() => {
    documentBody = render(<LoadingPage />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
