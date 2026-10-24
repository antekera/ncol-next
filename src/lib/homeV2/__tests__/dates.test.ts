import { formatHomeDate } from '../dates'
it('interprets WordPress local dates in Venezuela consistently across server and browser', () => {
  expect(formatHomeDate('2026-10-17T00:30:00', true)).toBe('00:30')
  expect(formatHomeDate('2026-10-17T04:30:00Z', true)).toBe('00:30')
  expect(formatHomeDate('2026-10-17')).toContain('17 de octubre de 2026')
})
it('omits malformed dates instead of crashing an editorial module', () => {
  expect(formatHomeDate('broken')).toBeNull()
  expect(formatHomeDate(undefined)).toBeNull()
})
