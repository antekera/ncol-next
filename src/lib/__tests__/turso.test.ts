jest.mock('@libsql/client/web', () => ({
  createClient: jest.fn()
}))

import { withTursoRetry } from '@lib/turso'

describe('withTursoRetry', () => {
  it('retries one transient Turso service failure', async () => {
    const operation = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error('Server returned HTTP status 502'))
      .mockResolvedValueOnce('ok')

    await expect(withTursoRetry(operation)).resolves.toBe('ok')
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it('does not retry malformed configuration errors', async () => {
    const operation = jest
      .fn<Promise<never>, []>()
      .mockRejectedValue(new Error('The URL is not in a valid format'))

    await expect(withTursoRetry(operation)).rejects.toThrow(
      'The URL is not in a valid format'
    )
    expect(operation).toHaveBeenCalledTimes(1)
  })
})
