import React from 'react'

import { render } from '@testing-library/react'

import { Container } from '..'

const children = 'Content'

describe('Container', () => {
  test('should contain children', () => {
    const { container } = render(<Container>{children}</Container>)
    expect(container).toContainHTML(children)
  })
})
