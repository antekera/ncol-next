import { render } from '@testing-library/react'

import { SectionSeparator } from '..'

describe('SectionSeparator', () => {
  test('should match snapshots', () => {
    const { container } = render(<SectionSeparator />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
