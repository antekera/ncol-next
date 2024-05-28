import { render } from '@testing-library/react'

import { ProgressBar } from '..'

describe('ProgressBar', () => {
  test('should match snapshots', () => {
    const { container } = render(<ProgressBar />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
