import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { ButtonGoTop } from '..'

let documentBody: RenderResult

describe('ButtonGoTop', () => {
  beforeEach(() => {
    documentBody = render(<ButtonGoTop />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
