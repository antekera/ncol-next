import { render } from '@testing-library/react'

import { ProgressBar } from '..'

// TODO: Skipping tests temporarily
describe.skip('ProgressBar', () => {
  test('should match snapshots', () => {
    const { container } = render(<ProgressBar />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
