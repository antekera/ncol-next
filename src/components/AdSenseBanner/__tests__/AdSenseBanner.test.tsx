import { render, screen } from '@testing-library/react'
import { AdSenseBanner } from '..'

// Mock the environment utility
jest.mock('@lib/utils/env', () => ({
  isProd: false
}))

jest.mock('@lib/config', () => ({
  DISABLE_ADSENSE_BANNERS: false
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

  test('does not render when DISABLE_ADSENSE_BANNERS is true', async () => {
    jest.doMock('@lib/config', () => ({
      DISABLE_ADSENSE_BANNERS: true
    }))
    const { AdSenseBanner } = await import('..')
    const { container } = render(<AdSenseBanner data={mockData} />)
    expect(container.firstChild).toBeNull()
  })

  test('renders directly when not in production', async () => {
    jest.doMock('@lib/config', () => ({
      DISABLE_ADSENSE_BANNERS: false
    }))
    // Re-require to ensure mock is used as set initially
    const { AdSenseBanner } = await import('..')
    render(<AdSenseBanner data={mockData} />)
    expect(screen.queryByTestId('ad-client')).not.toBeInTheDocument()
    expect(document.querySelector('.adsbygoogle')).toBeInTheDocument()
  })

  test('renders with AdClient when in production', async () => {
    // Change the mock implementation for this test
    jest.mock('@lib/utils/env', () => ({
      isProd: true
    }))
    jest.doMock('@lib/config', () => ({
      DISABLE_ADSENSE_BANNERS: false
    }))
    // We need to re-import the component so it uses the updated mock
    const { AdSenseBanner } = await import('..')

    render(<AdSenseBanner data={mockData} />)

    expect(screen.getByTestId('ad-client')).toBeInTheDocument()
  })
})
