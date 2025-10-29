import { retryFetch } from '../retryFetch'

describe('retryFetch', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('returns immediately on first success', async () => {
    const fetchFn = jest.fn().mockResolvedValue('ok')
    const resPromise = retryFetch(fetchFn, { maxRetries: 3, delayMs: 100 })
    await expect(resPromise).resolves.toBe('ok')
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  test('retries until success and calls onRetry between attempts', async () => {
    const onRetry = jest.fn()
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('done')

    const res = retryFetch(fetchFn, { maxRetries: 3, delayMs: 100, onRetry })
    await Promise.resolve()
    jest.advanceTimersByTime(100)
    await expect(res).resolves.toBe('done')

    expect(fetchFn).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenNthCalledWith(1, 1)
  })

  test('returns null when exhausted', async () => {
    const fetchFn = jest.fn().mockResolvedValue(null)
    const res = retryFetch(fetchFn, { maxRetries: 2, delayMs: 100 })
    await Promise.resolve()
    jest.advanceTimersByTime(100)
    await expect(res).resolves.toBeNull()
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})
