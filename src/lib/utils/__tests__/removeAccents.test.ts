import { removeAccents } from '..'

describe('removeAccents', () => {
  // Keep your existing test.each
  test.each`
    name            | expected
    ${'Música'}     | ${'Musica'}
    ${'tecnología'} | ${'tecnologia'}
  `('should normalize "$name" from given value', ({ name, expected }) => {
    expect(removeAccents(name)).toBe(expected)
  })

  // Add a simple test case
  test('should remove accents from a string', () => {
    expect(removeAccents('áéíóú')).toBe('aeiou')
  })
})
