import { render } from '@testing-library/react'
import { PageTitle } from '..'

describe('PageTitle', () => {
  test('should match snapshots', () => {
    const { container } = render(<PageTitle text='Post title' />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
