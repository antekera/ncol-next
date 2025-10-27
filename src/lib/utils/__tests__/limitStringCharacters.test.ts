import { limitStringCharacters } from '../limitStringCharacters'

describe('limitStringCharacters', () => {
  test('returns input when shorter than limit', () => {
    expect(limitStringCharacters('short', 10)).toBe('short')
  })

  test('truncates and appends ellipsis when over limit', () => {
    expect(limitStringCharacters('abcdefghij', 5)).toBe('abcde...')
  })
})
