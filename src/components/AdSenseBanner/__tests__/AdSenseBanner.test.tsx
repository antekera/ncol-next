import { render, screen } from '@testing-library/react'
import { AdSenseBanner } from '..'

// Mock the environment utility
jest.mock('@lib/utils/env', () => ({
  isProd: false
}))

// Mock AdClient component
jest.mock('@components/AdSenseBanner/AdClient', () => ({
  AdClient: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='ad-client'>{children}</div>
  )
}))

describe('AdSenseBanner', () => {
  const mockData = {
    'data-ad-format': 'auto',
    'data-ad-slot': '1234567890'
  }

  beforeEach(() => {
    jest.resetModules()
  })

  test('does not render without data', () => {
    const { container } = render(
      <AdSenseBanner data={undefined} className={undefined} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders directly when not in production', async () => {
    // Re-require to ensure mock is used as set initially
    const { AdSenseBanner } = await import('..')
    render(<AdSenseBanner data={mockData} />)

    // Should NOT be wrapped in AdClient logic (which we mocked but logic says only if isProd)
    // Wait, the logic is: isProd ? <AdClient>{children}</AdClient> : <>{children}</>
    // So if isProd is false, AdClient should NOT be present.
    expect(screen.queryByTestId('ad-client')).not.toBeInTheDocument()
    // It should render the ins tag
    expect(document.querySelector('.adsbygoogle')).toBeInTheDocument()
  })

  test('renders with AdClient when in production', async () => {
    // Change the mock implementation for this test
    jest.mock('@lib/utils/env', () => ({
      isProd: true
    }))
    // We need to re-import the component so it uses the updated mock
    const { AdSenseBanner } = await import('..')

    render(<AdSenseBanner data={mockData} />)

    expect(screen.getByTestId('ad-client')).toBeInTheDocument()
  })
})
