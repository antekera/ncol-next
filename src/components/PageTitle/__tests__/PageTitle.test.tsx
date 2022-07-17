import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { PageTitle } from '..'

let documentBody: RenderResult

describe('PageTitle', () => {
  beforeEach(() => {
    documentBody = render(<PageTitle />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
