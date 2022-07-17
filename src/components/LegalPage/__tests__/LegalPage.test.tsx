import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { LegalPage } from '..'

let documentBody: RenderResult

describe('LegalPage', () => {
  beforeEach(() => {
    documentBody = render(<LegalPage />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
