import {
  getStorageItem,
  getStorageKeys,
  setStorageItem
} from '@lib/utils/browserStorage'

describe('browserStorage', () => {
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'localStorage'
  )

  afterEach(() => {
    jest.restoreAllMocks()
    if (localStorageDescriptor) {
      Object.defineProperty(window, 'localStorage', localStorageDescriptor)
    }
    localStorage.clear()
  })

  it('lists stored keys without modifying pending counts', () => {
    localStorage.setItem('ncol_v_ad-1_2026-10-23', '2')
    localStorage.setItem('ncol_c_ad-1_2026-10-23', '1')

    expect(getStorageKeys('local')).toEqual([
      'ncol_v_ad-1_2026-10-23',
      'ncol_c_ad-1_2026-10-23'
    ])
    expect(localStorage.getItem('ncol_v_ad-1_2026-10-23')).toBe('2')
  })

  it('treats a throwing length getter as unavailable and recovers later', () => {
    localStorage.setItem('pending', '2')
    const length = jest
      .spyOn(Storage.prototype, 'length', 'get')
      .mockImplementation(() => {
        throw new DOMException('Storage unavailable', 'NS_ERROR_FAILURE')
      })

    expect(getStorageKeys('local')).toEqual([])
    length.mockRestore()
    expect(getStorageKeys('local')).toEqual(['pending'])
    expect(localStorage.getItem('pending')).toBe('2')
  })

  it('discards incomplete enumeration when key throws without deleting data', () => {
    localStorage.setItem('first', '1')
    localStorage.setItem('second', '2')
    const originalKey = localStorage.key.bind(localStorage)
    jest.spyOn(Storage.prototype, 'key').mockImplementation(index => {
      if (index === 1)
        throw new DOMException('Storage unavailable', 'NS_ERROR_FAILURE')
      return originalKey(index)
    })

    expect(getStorageKeys('local')).toEqual([])
    expect(localStorage.getItem('first')).toBe('1')
    expect(localStorage.getItem('second')).toBe('2')
  })

  it('treats blocked storage as unavailable instead of throwing', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Access is denied', 'SecurityError')
      }
    })

    expect(getStorageKeys('local')).toEqual([])
    expect(getStorageItem('local', 'preference')).toBeNull()
    expect(() => setStorageItem('local', 'preference', 'value')).not.toThrow()
  })
})
