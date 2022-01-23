import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { Layout } from '..'

let documentBody: RenderResult

describe('Layout', () => {
  beforeEach(() => {
    documentBody = render(<Layout>Content</Layout>)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
