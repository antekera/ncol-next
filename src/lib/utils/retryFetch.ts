type RetryOptions = {
  maxRetries?: number
  delayMs?: number
  onRetry?: (attempt: number) => void
}

export async function retryFetch<T>(
  fetchFn: () => Promise<T | null | undefined>,
  options: RetryOptions = {}
): Promise<T | null> {
  const { maxRetries = 2, delayMs = 1000, onRetry } = options
  let retryCount = 0

  while (retryCount < maxRetries) {
    const result = await fetchFn()
    if (result !== null && result !== undefined) {
      return result
    }

    retryCount++
    if (retryCount < maxRetries) {
      if (onRetry) onRetry(retryCount)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return null
}
