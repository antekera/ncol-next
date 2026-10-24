jest.mock('@libsql/client/web', () => ({
  createClient: jest.fn()
}))

import { withTursoRetry, getTursoViews } from '@lib/turso'
import { createClient, type Client } from '@libsql/client/web'

describe('withTursoRetry', () => {
  it('retries transient Turso service failures', async () => {
    const operation = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error('Server returned HTTP status 502'))
      .mockRejectedValueOnce(new Error('Server returned HTTP status 502'))
      .mockResolvedValueOnce('ok')

    await expect(withTursoRetry(operation)).resolves.toBe('ok')
    expect(operation).toHaveBeenCalledTimes(3)
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

it('keeps the existing shared client when a Home read owns a timed transport', () => {
  const original = process.env
  process.env = {
    ...original,
    TURSO_DB_URL: 'libsql://fixture.invalid',
    TURSO_AUTH_TOKEN: 'fixture-token'
  }
  jest
    .mocked(createClient)
    .mockImplementation(() => ({ close: jest.fn() }) as unknown as Client)
  try {
    const shared = getTursoViews()
    const transport = jest.fn()
    const owned = getTursoViews(transport)
    expect(owned).not.toBe(shared)
    expect(getTursoViews()).toBe(shared)
    expect(createClient).toHaveBeenCalledWith({
      url: 'https://fixture.invalid',
      authToken: 'fixture-token',
      fetch: transport
    })
  } finally {
    process.env = original
    jest.mocked(createClient).mockReset()
  }
})

it('does not silently ignore the deadline for a non-HTTP transport', () => {
  const original = process.env
  process.env = {
    ...original,
    TURSO_DB_URL: 'wss://fixture.invalid',
    TURSO_AUTH_TOKEN: 'fixture-token'
  }
  try {
    expect(() => getTursoViews(jest.fn())).toThrow(
      'Timed Turso reads require HTTP transport'
    )
    expect(createClient).not.toHaveBeenCalled()
  } finally {
    process.env = original
  }
})
