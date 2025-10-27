import { render, screen, act } from '@testing-library/react'
import { WhatsappDialog } from '..'

jest.mock('@lib/hooks/useIsMobile', () => ({ useIsMobile: () => true }))

describe('WhatsappDialog', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('opens after scroll and delay when conditions met, closes on click', async () => {
    localStorage.setItem('facebookDialogShown', 'true')
    render(<WhatsappDialog />)

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    // allow state update hasScrolled
    await Promise.resolve()
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(
      await screen.findByText(/No te pierdas de nada/i)
    ).toBeInTheDocument()

    act(() => {
      screen.getByTitle('Cerrar').click()
    })
    expect(localStorage.getItem('whatsappDialogShown')).toBe('true')
  })
})
