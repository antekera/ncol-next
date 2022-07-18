import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { Share } from '..'

let documentBody: RenderResult

describe('Share', () => {
  beforeEach(() => {
    documentBody = render(<Share />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
