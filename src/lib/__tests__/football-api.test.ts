import { fetchStandingsMundial } from '../football-api'

describe('fetchStandingsMundial', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    global.fetch = jest.fn()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should throw an error if FOOTBALL_DATA_API_KEY is not defined', async () => {
    delete process.env.FOOTBALL_DATA_API_KEY

    await expect(fetchStandingsMundial()).rejects.toThrow(
      'FOOTBALL_DATA_API_KEY is not defined in environment variables'
    )
  })

  it('should call fetch with correct url and headers, and return response json', async () => {
    process.env.FOOTBALL_DATA_API_KEY = 'test-api-key'

    const mockApiResponse = {
      competition: { code: 'WC', name: 'FIFA World Cup' },
      season: { id: 123, startDate: '2026-06-11' },
      standings: [
        {
          stage: 'GROUP_STAGE',
          type: 'TOTAL',
          group: 'GROUP_A',
          table: [
            {
              position: 1,
              team: { id: 1, name: 'Mexico', tla: 'MEX' },
              playedGames: 0,
              won: 0,
              draw: 0,
              lost: 0,
              points: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0
            }
          ]
        }
      ]
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    })

    const result = await fetchStandingsMundial()

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.football-data.org/v4/competitions/WC/standings?season=2026',
      {
        headers: { 'X-Auth-Token': 'test-api-key' },
        next: { revalidate: 3600 }
      }
    )
    expect(result).toEqual(mockApiResponse)
  })

  it('should throw an error if fetch response is not ok', async () => {
    process.env.FOOTBALL_DATA_API_KEY = 'test-api-key'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Forbidden'
    })

    await expect(fetchStandingsMundial()).rejects.toThrow(
      'Failed to fetch World Cup standings: Forbidden'
    )
  })
})
