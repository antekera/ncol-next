import { render, screen } from '@testing-library/react'
import Template from '../template'
import { GAPageView } from '@lib/utils/ga'
import { StrictMode } from 'react'

let mockPathname = '/'
let mockDemo = false
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }))
jest.mock('next/dynamic', () => () => () => (
  <span data-testid='social-banners' />
))
jest.mock('@lib/utils', () => ({ isDev: false }))
jest.mock('@lib/utils/ga', () => ({ GAPageView: jest.fn() }))
jest.mock('@lib/adDemo', () => ({ isBrowserAdDemoMode: () => mockDemo }))
jest.mock('@components/DeferredRender', () => ({
  DeferredRender: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
}))
jest.mock('@components/DeferredGoogleTagManager', () => ({
  DeferredGoogleTagManager: () => <span data-testid='gtm' />
}))

beforeEach(() => {
  mockPathname = '/'
  mockDemo = false
  jest.clearAllMocks()
})
it('preserves deferred public scripts and the existing route page view', () => {
  render(
    <Template>
      <p>Public content</p>
    </Template>
  )
  expect(screen.getByText('Public content')).toBeVisible()
  expect(screen.getByTestId('gtm')).toBeInTheDocument()
  expect(screen.getByTestId('social-banners')).toBeInTheDocument()
  expect(GAPageView).toHaveBeenCalledTimes(1)
  expect(GAPageView).toHaveBeenCalledWith(
    expect.objectContaining({ pageType: 'PAGE', pageUrl: '/' })
  )
})
it('keeps normal local preview free of third-party script mounts', () => {
  mockPathname = '/home-v2-preview/'
  render(
    <Template>
      <p>QA</p>
    </Template>
  )
  expect(screen.queryByTestId('gtm')).not.toBeInTheDocument()
  expect(screen.queryByTestId('social-banners')).not.toBeInTheDocument()
})
it('preserves ad-demo script exclusion and page-view suppression', () => {
  mockDemo = true
  render(
    <Template>
      <p>Demo</p>
    </Template>
  )
  expect(screen.queryByTestId('gtm')).not.toBeInTheDocument()
  expect(screen.queryByTestId('social-banners')).not.toBeInTheDocument()
  expect(GAPageView).not.toHaveBeenCalled()
})

it('does not duplicate the existing view during the StrictMode effect cycle', () => {
  render(
    <StrictMode>
      <Template>
        <p>Contenido</p>
      </Template>
    </StrictMode>
  )
  expect(GAPageView).toHaveBeenCalledTimes(1)
})
