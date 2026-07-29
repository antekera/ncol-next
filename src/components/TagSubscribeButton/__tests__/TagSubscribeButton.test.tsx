import { act, fireEvent, render, screen } from '@testing-library/react'
import { GA_EVENTS } from '@lib/constants'
import { TagSubscribeButton } from '..'

const mockGetSession = jest.fn()
const openLoginModal = jest.fn()
const requestOneSignalPermission = jest.fn()

jest.mock('@lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: mockGetSession } })
}))

jest.mock('@components/auth/LoginModalContext', () => ({
  useLoginModal: () => ({ openLoginModal })
}))

jest.mock('@lib/oneSignalWeb', () => ({
  requestOneSignalPermission: () => requestOneSignalPermission()
}))

jest.mock('@lib/utils', () => ({
  GAEvent: jest.fn()
}))

import { GAEvent } from '@lib/utils'

const PENDING_TAG_KEY = 'ncol_pending_tag_subscribe'

const flushPromises = () =>
  act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })

const jsonResponse = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => body
})

describe('TagSubscribeButton', () => {
  beforeEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    sessionStorage.clear()
    global.fetch = jest.fn()
  })

  test('logged-out visitors never call the status API', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(
      <TagSubscribeButton tagSlug='cine' tagName='Cine' variant='banner' />
    )
    await flushPromises()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(screen.getByText('Suscribirme')).toBeInTheDocument()
  })

  test('banner variant subscribes and requests OneSignal permission', async () => {
    mockGetSession.mockResolvedValue({ data: { session: {} } })
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ subscribed: false }))
      .mockResolvedValueOnce(jsonResponse({}))

    render(
      <TagSubscribeButton tagSlug='cine' tagName='Cine' variant='banner' />
    )
    await flushPromises()

    fireEvent.click(screen.getByRole('button'))
    await flushPromises()

    expect(GAEvent).toHaveBeenCalledWith({
      action: GA_EVENTS.TAG_SUBSCRIBE.SUBSCRIBE,
      category: GA_EVENTS.TAG_SUBSCRIBE.CATEGORY,
      label: 'cine'
    })
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/tags/subscription/',
      expect.objectContaining({ method: 'POST' })
    )
    expect(requestOneSignalPermission).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Suscrito')).toBeInTheDocument()
  })

  test('banner variant unsubscribes without requesting permission', async () => {
    mockGetSession.mockResolvedValue({ data: { session: {} } })
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ subscribed: true }))
      .mockResolvedValueOnce(jsonResponse({}))

    render(
      <TagSubscribeButton tagSlug='cine' tagName='Cine' variant='banner' />
    )
    await flushPromises()
    expect(screen.getByText('Suscrito')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    await flushPromises()

    expect(GAEvent).toHaveBeenCalledWith({
      action: GA_EVENTS.TAG_SUBSCRIBE.UNSUBSCRIBE,
      category: GA_EVENTS.TAG_SUBSCRIBE.CATEGORY,
      label: 'cine'
    })
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/tags/subscription/',
      expect.objectContaining({ method: 'DELETE' })
    )
    expect(requestOneSignalPermission).not.toHaveBeenCalled()
    expect(screen.getByText('Suscribirme')).toBeInTheDocument()
  })

  test('icon variant shows a confirm popover, cancel closes it without toggling', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    render(<TagSubscribeButton tagSlug='cine' tagName='Cine' variant='icon' />)
    await flushPromises()

    fireEvent.click(screen.getByRole('button', { name: /suscribirte a cine/i }))
    expect(
      screen.getByText(/¿suscribirte a #cine y recibir una alerta/i)
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(
      screen.queryByText(/¿suscribirte a #cine y recibir una alerta/i)
    ).not.toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('icon variant confirm triggers the subscribe toggle', async () => {
    mockGetSession.mockResolvedValue({ data: { session: {} } })
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ subscribed: false }))
      .mockResolvedValueOnce(jsonResponse({}))

    render(<TagSubscribeButton tagSlug='cine' tagName='Cine' variant='icon' />)
    await flushPromises()

    fireEvent.click(screen.getByRole('button', { name: /suscribirte a cine/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    await flushPromises()

    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/tags/subscription/',
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('a 401 on toggle opens the login modal and resumes the subscribe on success', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({}, false, 401))
      .mockResolvedValueOnce(jsonResponse({}))

    render(
      <TagSubscribeButton tagSlug='cine' tagName='Cine' variant='banner' />
    )
    await flushPromises()

    fireEvent.click(screen.getByRole('button'))
    await flushPromises()

    expect(openLoginModal).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem(PENDING_TAG_KEY)).toBe('cine')

    const onSuccessCallback = openLoginModal.mock.calls[0][0]
    await act(async () => {
      await onSuccessCallback()
    })

    expect(sessionStorage.getItem(PENDING_TAG_KEY)).toBeNull()
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/tags/subscription/',
      expect.objectContaining({ method: 'POST' })
    )
    expect(requestOneSignalPermission).toHaveBeenCalledTimes(1)
  })

  test('resumes a pending subscribe left by a Google OAuth redirect on mount', async () => {
    sessionStorage.setItem(PENDING_TAG_KEY, 'cine')
    mockGetSession.mockResolvedValue({ data: { session: {} } })
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ subscribed: false }))
      .mockResolvedValueOnce(jsonResponse({}))

    render(
      <TagSubscribeButton tagSlug='cine' tagName='Cine' variant='banner' />
    )
    await flushPromises()

    // This races against the separate "check current status" effect (also
    // fired on mount) for which setStatus() call lands last — not asserting
    // the final label here, just that the resume itself actually happened.
    expect(sessionStorage.getItem(PENDING_TAG_KEY)).toBeNull()
    expect(requestOneSignalPermission).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tags/subscription/',
      expect.objectContaining({ method: 'POST' })
    )
  })
})
