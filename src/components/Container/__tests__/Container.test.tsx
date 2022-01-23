import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { Container } from '..'

let documentBody: RenderResult

describe('Container', () => {
  beforeEach(() => {
    documentBody = render(<Container>Content</Container>)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
