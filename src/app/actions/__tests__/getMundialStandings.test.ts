import { getMundialStandings } from '../getMundialStandings'
import { fetchStandingsMundial } from '@lib/football-api'
import { log } from '@logtail/next'

jest.mock('@lib/football-api', () => ({
  fetchStandingsMundial: jest.fn()
}))

jest.mock('@logtail/next', () => ({
  log: {
    error: jest.fn()
  }
}))

describe('getMundialStandings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty array if standings data is null or empty', async () => {
    ;(fetchStandingsMundial as jest.Mock).mockResolvedValueOnce(null)
    const result = await getMundialStandings()
    expect(result).toEqual([])
    ;(fetchStandingsMundial as jest.Mock).mockResolvedValueOnce({})
    const result2 = await getMundialStandings()
    expect(result2).toEqual([])
  })

  it('should return mapped and translated standings when grouped standings exist', async () => {
    const mockApiResponse = {
      standings: [
        {
          stage: 'GROUP_STAGE',
          type: 'TOTAL',
          group: 'GROUP_B',
          table: [
            {
              position: 1,
              team: { id: 2, name: 'Korea Republic' },
              playedGames: 1,
              won: 1,
              draw: 0,
              lost: 0,
              points: 3,
              goalsFor: 2,
              goalsAgainst: 0
            }
          ]
        },
        {
          stage: 'GROUP_STAGE',
          type: 'TOTAL',
          group: 'GROUP_A',
          table: [
            {
              position: 1,
              team: { id: 1, name: 'IR Iran' },
              playedGames: 1,
              won: 0,
              draw: 1,
              lost: 0,
              points: 1,
              goalsFor: 1,
              goalsAgainst: 1
            }
          ]
        },
        {
          stage: 'GROUP_STAGE',
          type: 'HOME',
          group: 'GROUP_A',
          table: []
        }
      ]
    }

    ;(fetchStandingsMundial as jest.Mock).mockResolvedValueOnce(mockApiResponse)

    const result = await getMundialStandings()

    // Group A should be first due to sorting, and Group B second.
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      grupo: 'Grupo A',
      teams: [
        {
          team: 'Iran',
          pj: 1,
          g: 0,
          e: 1,
          p: 0,
          gf: 1,
          ga: 1,
          pts: 1
        }
      ]
    })
    expect(result[1]).toEqual({
      grupo: 'Grupo B',
      teams: [
        {
          team: 'South Korea',
          pj: 1,
          g: 1,
          e: 0,
          p: 0,
          gf: 2,
          ga: 0,
          pts: 3
        }
      ]
    })
  })

  it('should fallback to chunked standings if group is null', async () => {
    const mockApiResponse = {
      standings: [
        {
          stage: 'GROUP_STAGE',
          type: 'TOTAL',
          group: null,
          table: [
            {
              team: { name: 'Mexico' },
              playedGames: 0,
              won: 0,
              draw: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              points: 0
            },
            {
              team: { name: 'USA' },
              playedGames: 0,
              won: 0,
              draw: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              points: 0
            },
            {
              team: { name: 'Canada' },
              playedGames: 0,
              won: 0,
              draw: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              points: 0
            },
            {
              team: { name: 'Argentina' },
              playedGames: 0,
              won: 0,
              draw: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              points: 0
            },
            {
              team: { name: 'Brazil' },
              playedGames: 0,
              won: 0,
              draw: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              points: 0
            }
          ]
        }
      ]
    }

    ;(fetchStandingsMundial as jest.Mock).mockResolvedValueOnce(mockApiResponse)

    const result = await getMundialStandings()

    expect(result).toHaveLength(2) // 5 teams total / 4 = 2 groups
    expect(result[0].grupo).toBe('Grupo A')
    expect(result[0].teams).toHaveLength(4)
    expect(result[1].grupo).toBe('Grupo B')
    expect(result[1].teams).toHaveLength(1)
    expect(result[1].teams[0].team).toBe('Brazil')
  })

  it('should log an error and return empty array if fetchStandingsMundial throws', async () => {
    const error = new Error('API failure')
    ;(fetchStandingsMundial as jest.Mock).mockRejectedValueOnce(error)

    const result = await getMundialStandings()

    expect(result).toEqual([])
    expect(log.error).toHaveBeenCalledWith(
      'Error fetching/mapping standings from API',
      { error: 'API failure' }
    )
  })
})
