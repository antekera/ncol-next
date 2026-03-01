import { render, screen, act } from '@testing-library/react'
import { SocialBanners } from '../index'
import userEvent from '@testing-library/user-event'

jest.mock('@components/Icon', () => ({
  Icon: () => <svg data-testid='mock-icon' />
}))

describe('SocialBanners', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('renders nothing initially before mount', () => {
    const { container } = render(<SocialBanners />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows Whatsapp banner after 3 seconds if not dismissed', () => {
    render(<SocialBanners />)
    expect(
      screen.queryByText('¡Únete a nuestro canal!')
    ).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(screen.getByText('¡Únete a nuestro canal!')).toBeInTheDocument()
    expect(screen.getByText('Seguir en WhatsApp')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://whatsapp.com/channel/0029VbALBGh77qVUp56yeN1b'
    )
  })

  it('dismisses Whatsapp banner and schedules Facebook banner', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<SocialBanners />)

    // Wait for WA banner
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(screen.getByText('¡Únete a nuestro canal!')).toBeInTheDocument()

    const dismissBtn = screen.getByRole('button', { name: 'Quitar' })
    await user.click(dismissBtn)

    // Wait for WA banner out animation
    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(
      screen.queryByText('¡Únete a nuestro canal!')
    ).not.toBeInTheDocument()
    expect(localStorage.getItem('ncol_wa_dismissed')).toBe('true')

    // Wait for FB banner to appear (1s after WA dismissed)
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('¡Síguenos en Facebook!')).toBeInTheDocument()
    expect(screen.getByText('Seguir en Facebook')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.facebook.com/noticiasdelacol/'
    )
  })

  it('shows Facebook banner immediately if Whatsapp was dismissed', () => {
    localStorage.setItem('ncol_wa_dismissed', 'true')
    render(<SocialBanners />)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(screen.getByText('¡Síguenos en Facebook!')).toBeInTheDocument()
    expect(
      screen.queryByText('¡Únete a nuestro canal!')
    ).not.toBeInTheDocument()
  })

  it('dismisses Facebook banner', async () => {
    localStorage.setItem('ncol_wa_dismissed', 'true')
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<SocialBanners />)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(screen.getByText('¡Síguenos en Facebook!')).toBeInTheDocument()

    const dismissBtn = screen.getByRole('button', { name: 'Quitar' })
    await user.click(dismissBtn)

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.queryByText('¡Síguenos en Facebook!')).not.toBeInTheDocument()
    expect(localStorage.getItem('ncol_fb_dismissed')).toBe('true')
  })

  it('renders nothing if both are dismissed', () => {
    localStorage.setItem('ncol_wa_dismissed', 'true')
    localStorage.setItem('ncol_fb_dismissed', 'true')
    render(<SocialBanners />)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(screen.queryByText('¡Síguenos en Facebook!')).not.toBeInTheDocument()
    expect(
      screen.queryByText('¡Únete a nuestro canal!')
    ).not.toBeInTheDocument()
  })
})
