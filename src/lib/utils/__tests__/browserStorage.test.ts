import { getStorageItem, setStorageItem } from '@lib/utils/browserStorage'

describe('browserStorage', () => {
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'localStorage'
  )

  afterEach(() => {
    if (localStorageDescriptor) {
      Object.defineProperty(window, 'localStorage', localStorageDescriptor)
    }
  })

  it('treats blocked storage as unavailable instead of throwing', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Access is denied', 'SecurityError')
      }
    })

    expect(getStorageItem('local', 'preference')).toBeNull()
    expect(() => setStorageItem('local', 'preference', 'value')).not.toThrow()
  })
})
