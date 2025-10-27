import { render } from '@testing-library/react'
import { AdClient } from '../AdClient'
import { captureException } from '@sentry/browser'

jest.mock('@sentry/browser', () => ({ captureException: jest.fn() }))

describe('AdClient', () => {
  test('pushes ad slot on mount', () => {
    const original = (window as any).adsbygoogle
    ;(window as any).adsbygoogle = []
    render(
      <AdClient>
        <div>ad</div>
      </AdClient>
    )
    expect(Array.isArray((window as any).adsbygoogle)).toBe(true)
    // pushing has occurred; length >= 1
    expect((window as any).adsbygoogle.length).toBeGreaterThan(0)
    ;(window as any).adsbygoogle = original
  })

  test('captures error if pushing fails', () => {
    Object.defineProperty(window, 'adsbygoogle', {
      get: () => ({
        push: () => {
          throw new Error('boom')
        }
      }),
      set: () => {}
    }) as any
    render(
      <AdClient>
        <div>ad</div>
      </AdClient>
    )
    expect(captureException).toHaveBeenCalled()
  })
})
