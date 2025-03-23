import { render } from '@testing-library/react'
import { Newsletter } from '..'

describe('Newsletter', () => {
  test('should match snapshots', () => {
    const { container } = render(<Newsletter />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
