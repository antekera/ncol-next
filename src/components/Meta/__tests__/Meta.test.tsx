import { render } from '@testing-library/react'

import { Meta } from '..'

describe('Meta', () => {
  test('should match snapshots', () => {
    const { container } = render(<Meta />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
