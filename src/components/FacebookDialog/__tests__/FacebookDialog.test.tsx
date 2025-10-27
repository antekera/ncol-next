import { render, screen, act } from '@testing-library/react'
import { FacebookDialog } from '..'

jest.mock('react-facebook', () => ({ Page: () => <div /> }))

describe('FacebookDialog', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('opens after scroll and timeout, and closes on button click', async () => {
    render(<FacebookDialog />)

    // trigger scroll (once handler)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    // wait 3s timer
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // dialog content appears
    expect(
      await screen.findByText(/Recibe noticias en Facebook/i)
    ).toBeInTheDocument()

    // click close
    act(() => {
      screen.getByTitle('Cerrar').click()
    })

    expect(localStorage.getItem('facebookDialogShown')).toBe('true')
    expect(sessionStorage.getItem('facebookDialogSession')).toBe('true')
  })
})
