import { act, fireEvent, render, screen } from '@testing-library/react'
import { TagSubscribeOnboarding } from '..'

const openLoginModal = jest.fn()
jest.mock('@components/auth/LoginModalContext', () => ({
  useLoginModal: () => ({ openLoginModal })
}))

const STORAGE_KEY = 'ncol_onboarding_tag_subscribe_seen'

function renderWithTargets() {
  document.body.innerHTML = `
    <button data-onboarding-target="tag-subscribe"></button>
    <button data-onboarding-target="login-icon"></button>
  `
}

describe('TagSubscribeOnboarding', () => {
  let intersectionCallback: IntersectionObserverCallback | undefined

  beforeEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    localStorage.clear()
    document.body.innerHTML = ''
    intersectionCallback = undefined
    delete process.env.NEXT_PUBLIC_TAG_SUBSCRIBE_ONBOARDING_ENABLED

    class MockIntersectionObserver {
      constructor(cb: IntersectionObserverCallback) {
        intersectionCallback = cb
      }
      observe = jest.fn()
      unobserve = jest.fn()
      disconnect = jest.fn()
      takeRecords = () => []
      root = null
      rootMargin = ''
      thresholds: number[] = []
    }
    global.IntersectionObserver = MockIntersectionObserver
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_TAG_SUBSCRIBE_ONBOARDING_ENABLED
  })

  test('renders nothing when the feature flag is off (the shipped default)', () => {
    renderWithTargets()
    render(<TagSubscribeOnboarding />)

    expect(intersectionCallback).toBeUndefined()
    expect(screen.queryByText('Suscríbete a un tema')).not.toBeInTheDocument()
  })

  describe('when NEXT_PUBLIC_TAG_SUBSCRIBE_ONBOARDING_ENABLED=true', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_TAG_SUBSCRIBE_ONBOARDING_ENABLED = 'true'
    })

    test('does not start the tour if either target is missing from the DOM', () => {
      document.body.innerHTML =
        '<button data-onboarding-target="tag-subscribe"></button>'
      render(<TagSubscribeOnboarding />)

      expect(intersectionCallback).toBeUndefined()
    })

    test('does not start again once the tour was already seen', () => {
      localStorage.setItem(STORAGE_KEY, '1')
      renderWithTargets()
      render(<TagSubscribeOnboarding />)

      expect(intersectionCallback).toBeUndefined()
    })

    test('walks through both steps and opens the login modal on finish', async () => {
      renderWithTargets()
      render(<TagSubscribeOnboarding />)

      expect(intersectionCallback).toBeDefined()
      await act(async () => {
        intersectionCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })

      expect(screen.getByText('Suscríbete a un tema')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }))
      expect(
        screen.getByText('Inicia sesión para activarlo')
      ).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /entendido/i }))

      expect(localStorage.getItem(STORAGE_KEY)).toBe('1')
      expect(openLoginModal).toHaveBeenCalledTimes(1)
      expect(
        screen.queryByText('Inicia sesión para activarlo')
      ).not.toBeInTheDocument()
    })

    test('"Omitir" ends the tour without opening the login modal', async () => {
      renderWithTargets()
      render(<TagSubscribeOnboarding />)

      await act(async () => {
        intersectionCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })

      fireEvent.click(screen.getByRole('button', { name: /omitir/i }))

      expect(localStorage.getItem(STORAGE_KEY)).toBe('1')
      expect(openLoginModal).not.toHaveBeenCalled()
    })
  })
})
