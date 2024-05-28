import { render } from '@testing-library/react'

import { SocialLinks } from '..'

describe('SocialLinks', () => {
  beforeEach(() => {})

  test('should match snapshots', () => {
    const { container } = render(<SocialLinks />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
