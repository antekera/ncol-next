import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { DateTime } from '..'

let documentBody: RenderResult

describe('DateTime', () => {
  beforeEach(() => {
    documentBody = render(<DateTime />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
