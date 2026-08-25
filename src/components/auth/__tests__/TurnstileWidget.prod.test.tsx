import { act, render } from '@testing-library/react'
import { TurnstileWidget } from '@components/auth/TurnstileWidget'

jest.mock('@lib/utils/env', () => ({ isProd: true }))

let onReadyCallback: (() => void) | undefined

jest.mock('next/script', () => ({
  __esModule: true,
  default: (props: { onReady?: () => void }) => {
    onReadyCallback = props.onReady
    return null
  }
}))

describe('TurnstileWidget (production)', () => {
  const originalTurnstile = window.turnstile

  beforeEach(() => {
    onReadyCallback = undefined
    window.turnstile = undefined
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
  })

  afterEach(() => {
    window.turnstile = originalTurnstile
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  })

  test('renders the widget container and calls turnstile.render once the SDK is ready', async () => {
    const renderWidget = jest.fn()
    window.turnstile = {
      getResponse: () => '',
      render: renderWidget,
      reset: jest.fn()
    }

    const { container } = render(<TurnstileWidget />)
    expect(container.querySelector('.cf-turnstile')).not.toBeNull()
    expect(renderWidget).not.toHaveBeenCalled()

    await act(async () => {
      onReadyCallback?.()
    })

    expect(renderWidget).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        sitekey: 'test-site-key',
        'error-callback': expect.any(Function)
      })
    )
  })
})
