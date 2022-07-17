import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { Icon } from '..'

let documentBody: RenderResult

describe('Icon', () => {
  beforeEach(() => {
    documentBody = render(<Icon />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
