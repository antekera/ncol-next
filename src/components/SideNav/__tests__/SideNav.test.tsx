import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { SideNav } from '..'

let documentBody: RenderResult

describe('SideNav', () => {
  beforeEach(() => {
    documentBody = render(<SideNav />)
  })

  test('should be defined', () => {
    expect(documentBody).toBeDefined()
  })
})
