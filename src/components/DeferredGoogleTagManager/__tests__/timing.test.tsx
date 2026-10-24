import { render, screen, act } from '@testing-library/react'
import { DeferredGoogleTagManager } from '..'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('@next/third-parties/google', () => ({
  GoogleTagManager: () => <span data-testid='gtm' />
}))
it('preserves the public Home mobile fallback timer', () => {
  jest.useFakeTimers()
  const idle = Object.getOwnPropertyDescriptor(window, 'requestIdleCallback')
  const width = window.innerWidth
  // Exercise the fallback timer deterministically; the idle/interaction path is unchanged.
  Reflect.deleteProperty(window, 'requestIdleCallback')
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 390
  })
  try {
    render(<DeferredGoogleTagManager gtmId='existing-container' />)
    act(() => jest.advanceTimersByTime(4999))
    expect(screen.queryByTestId('gtm')).not.toBeInTheDocument()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.getByTestId('gtm')).toBeInTheDocument()
  } finally {
    if (idle) Object.defineProperty(window, 'requestIdleCallback', idle)
    else Reflect.deleteProperty(window, 'requestIdleCallback')
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width
    })
    jest.useRealTimers()
  }
})
