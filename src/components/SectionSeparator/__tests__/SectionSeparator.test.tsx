import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { SectionSeparator } from '..'

let documentBody: RenderResult

describe('SectionSeparator', () => {
  beforeEach(() => {
    documentBody = render(<SectionSeparator />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
