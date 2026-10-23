import { act, fireEvent, render } from '@testing-library/react'
import { TurnstileWidget } from '@components/auth/TurnstileWidget'

jest.mock('@lib/utils/env', () => ({ isProd: true }))

const SDK_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

test('initializes every concurrent widget while loading the SDK only once', async () => {
  const originalTurnstile = window.turnstile
  const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const renderWidget = jest.fn()
  window.turnstile = undefined
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'

  try {
    const { container, rerender, unmount } = render(
      <TurnstileWidget key='contact' />
    )
    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_URL}"]`
    )!
    expect(script).not.toBeNull()

    rerender(
      <>
        <TurnstileWidget key='contact' />
        <TurnstileWidget key='login' />
      </>
    )
    rerender(
      <>
        <TurnstileWidget key='contact' />
        <TurnstileWidget key='login' />
        <TurnstileWidget key='register' />
      </>
    )
    expect(document.querySelectorAll(`script[src="${SDK_URL}"]`)).toHaveLength(
      1
    )
    expect(renderWidget).not.toHaveBeenCalled()

    window.turnstile = {
      getResponse: () => '',
      render: renderWidget,
      reset: jest.fn()
    }
    await act(async () => {
      fireEvent.load(script)
    })
    expect(renderWidget).toHaveBeenCalledTimes(3)
    const containers = Array.from(container.querySelectorAll('.cf-turnstile'))
    expect(renderWidget.mock.calls.map(([element]) => element)).toEqual(
      containers
    )

    // Reopening a modal after the cached SDK has loaded still initializes its new widget.
    rerender(<TurnstileWidget key='contact' />)
    rerender(
      <>
        <TurnstileWidget key='contact' />
        <TurnstileWidget key='reopened' />
      </>
    )
    await act(async () => {})
    expect(renderWidget).toHaveBeenCalledTimes(4)
    expect(document.querySelectorAll(`script[src="${SDK_URL}"]`)).toHaveLength(
      1
    )
    unmount()
    script.remove()
  } finally {
    window.turnstile = originalTurnstile
    if (originalSiteKey === undefined)
      delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey
  }
})
