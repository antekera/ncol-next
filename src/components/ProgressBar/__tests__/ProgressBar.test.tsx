import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { ProgressBar } from '..'

let documentBody: RenderResult

describe('ProgressBar', () => {
  beforeEach(() => {
    documentBody = render(<ProgressBar />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
