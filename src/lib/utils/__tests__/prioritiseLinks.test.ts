import { SERVICES_MENU } from '@lib/constants'
import { prioritiseLinks } from '../prioritiseLinks'

// Caracas is UTC-4. To get a specific Caracas time we add 4 hours to UTC.
// e.g. Caracas 09:00 Sunday = UTC 13:00 Sunday
function caracasDate(isoUtc: string) {
  return new Date(isoUtc)
}

describe('prioritiseLinks', () => {
  it('puts Horóscopo first on Sunday', () => {
    // 2025-04-13 is a Sunday. 13:00 UTC = 09:00 Caracas
    const links = prioritiseLinks(caracasDate('2025-04-13T13:00:00Z'))
    expect(links[0].name).toBe('Horóscopo')
  })

  it('puts Calculadora Dólar first on a weekday morning', () => {
    // 2025-04-14 is a Monday. 13:00 UTC = 09:00 Caracas
    const links = prioritiseLinks(caracasDate('2025-04-14T13:00:00Z'))
    expect(links[0].name).toBe('Calculadora Dólar')
  })

  it('keeps default order on a weekday afternoon', () => {
    // 2025-04-14 is a Monday. 18:00 UTC = 14:00 Caracas
    const links = prioritiseLinks(caracasDate('2025-04-14T18:00:00Z'))
    expect(links[0].name).not.toBe('Horóscopo')
    expect(links[0].name).not.toBe('Calculadora Dólar')
  })

  it('keeps default order on Saturday', () => {
    // 2025-04-12 is a Saturday. 13:00 UTC = 09:00 Caracas (morning but weekend)
    const links = prioritiseLinks(caracasDate('2025-04-12T13:00:00Z'))
    expect(links[0].name).not.toBe('Horóscopo')
    expect(links[0].name).not.toBe('Calculadora Dólar')
  })

  it('shows Horóscopo all day Sunday', () => {
    // 2025-04-13 Sunday. 22:00 UTC = 18:00 Caracas
    const links = prioritiseLinks(caracasDate('2025-04-13T22:00:00Z'))
    expect(links[0].name).toBe('Horóscopo')
  })

  it('does not duplicate any link', () => {
    const links = prioritiseLinks(caracasDate('2025-04-14T14:00:00Z'))
    const names = links.map(l => l.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('preserves all links', () => {
    const links = prioritiseLinks(caracasDate('2025-04-14T14:00:00Z'))
    expect(links).toHaveLength(SERVICES_MENU.length)
  })
})
