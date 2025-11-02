import { render } from '@testing-library/react'
import { AdSenseBanner } from '..'

describe('AdSenseBanner', () => {
  test('does not render without data', () => {
    const { container } = render(<AdSenseBanner data={undefined} />)
    expect(container.firstChild).toBeNull()
  })
})
